-- ChamaOS Multi-Tenant Migration
-- Run this in Supabase SQL Editor to add tenant support

-- 1. CORE TABLES

-- Chamas table (one per admin account)
CREATE TABLE IF NOT EXISTS chamas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL DEFAULT 'My Chama',
  registration_number TEXT,
  trademark TEXT,
  location TEXT,
  meeting_schedule TEXT,
  monthly_contribution NUMERIC DEFAULT 5000,
  loan_interest_rate NUMERIC DEFAULT 10,
  total_fund NUMERIC DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  total_loans_out NUMERIC DEFAULT 0,
  founded DATE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (links auth.users to chamas)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  chama_id UUID REFERENCES chamas(id) NOT NULL,
  member_id TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'member')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'member',
  join_date TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active',
  shares NUMERIC DEFAULT 0,
  total_contributed NUMERIC DEFAULT 0,
  total_loans NUMERIC DEFAULT 0
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  member_id TEXT,
  member_name TEXT,
  amount NUMERIC,
  date TEXT,
  month TEXT,
  type TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'pending',
  mpesa_ref TEXT
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  member_id TEXT,
  member_name TEXT,
  amount NUMERIC,
  interest NUMERIC DEFAULT 10,
  balance NUMERIC,
  disbursed_date TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'pending',
  purpose TEXT
);

-- Loan repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
  id TEXT PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  loan_id TEXT,
  amount NUMERIC,
  date TEXT,
  mpesa_ref TEXT
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  title TEXT,
  date TEXT,
  time TEXT,
  venue TEXT,
  status TEXT DEFAULT 'upcoming',
  agenda TEXT[],
  minutes TEXT DEFAULT '',
  attendees TEXT[]
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  endpoint TEXT NOT NULL,
  keys JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (M-Pesa)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  member_id TEXT,
  phone TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  mpesa_ref TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES chamas(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error')),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table (for in-app + email notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'payment_failed', 'payment_success', 'member_joined', 'loan_approved', 'meeting_reminder')),
  title TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_has_chama_access(chama_id));
CREATE POLICY "Admin manage notifications" ON notifications
  FOR ALL USING (is_chama_admin(chama_id));

CREATE INDEX IF NOT EXISTS idx_notifications_chama ON notifications(chama_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- User settings table (for notification preferences etc.)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- 2. BACKWARD COMPATIBILITY MIGRATIONS

-- Add chama_id to tables that may lack it
ALTER TABLE members ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE;
ALTER TABLE loan_repayments ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE;

-- Change chamas.founded from TEXT to DATE
ALTER TABLE chamas ALTER COLUMN founded TYPE DATE USING
  CASE
    WHEN founded ~ '^\d{4}$' THEN (founded || '-01-01')::date
    WHEN founded ~ '^\d{4}-\d{2}-\d{2}$' THEN founded::date
    ELSE NULL
  END;

-- Add NOT NULL constraints on push_subscriptions columns (safe for existing rows)
ALTER TABLE push_subscriptions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE push_subscriptions ALTER COLUMN endpoint SET NOT NULL;

-- Add CHECK constraint on transactions.status
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_status_check'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
  END IF;
END $$;

-- 3. HELPERS & SEEDING

-- Helper: get chama IDs for current user
CREATE OR REPLACE FUNCTION get_user_chama_ids()
RETURNS SETOF UUID
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT chama_id FROM profiles WHERE user_id = auth.uid()
$$;

-- Helper: check if current user is admin of a chama
CREATE OR REPLACE FUNCTION is_chama_admin(chama_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND chama_id = $1 AND role = 'admin'
  )
$$;

-- Helper: check if user has any access to a chama
CREATE OR REPLACE FUNCTION user_has_chama_access(chama_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND chama_id = $1
  )
$$;

-- Seed function: called after user signs up
CREATE OR REPLACE FUNCTION seed_chama(chama_name TEXT DEFAULT 'Umoja Wetu Investment Group')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_chama_id UUID;
  admin_user_id UUID := auth.uid();
BEGIN
  -- Create chama
  INSERT INTO chamas (admin_user_id, name, registration_number, trademark, location, meeting_schedule, monthly_contribution, loan_interest_rate, total_fund, total_members, total_loans_out, plan, founded)
  VALUES (
    admin_user_id, chama_name, 'KCH/2019/04521',
    'ChamaOS — Kenya''s #1 Chama Management Platform',
    'Nairobi, Westlands', 'Every 1st Saturday of the month',
    5000, 10, 1847500, 12, 420000, 'starter', '2019-01-01'
  )
  RETURNING id INTO new_chama_id;

  -- Create admin profile
  INSERT INTO profiles (user_id, chama_id, role, display_name)
  VALUES (admin_user_id, new_chama_id, 'admin', chama_name || ' Admin');

  -- Seed 12 members
  INSERT INTO members (id, chama_id, name, phone, email, role, join_date, avatar, status, shares, total_contributed, total_loans) VALUES
    ('m1', new_chama_id, 'Grace Wanjiku Kamau', '0712 345 678', 'grace@email.com', 'chairman', '2019-03-15', 'GW', 'active', 45, 225000, 0),
    ('m2', new_chama_id, 'David Otieno Achieng', '0723 456 789', 'david@email.com', 'treasurer', '2019-03-15', 'DO', 'active', 42, 210000, 50000),
    ('m3', new_chama_id, 'Faith Njeri Mwangi', '0734 567 890', 'faith@email.com', 'secretary', '2019-04-01', 'FN', 'active', 40, 200000, 0),
    ('m4', new_chama_id, 'James Kipchoge Rotich', '0745 678 901', 'james@email.com', 'member', '2019-04-01', 'JK', 'active', 38, 190000, 80000),
    ('m5', new_chama_id, 'Mary Akinyi Odhiambo', '0756 789 012', 'mary@email.com', 'member', '2019-05-15', 'MA', 'active', 36, 180000, 0),
    ('m6', new_chama_id, 'Peter Maina Githui', '0767 890 123', 'peter@email.com', 'member', '2019-05-15', 'PM', 'active', 34, 170000, 120000),
    ('m7', new_chama_id, 'Susan Chebet Koech', '0778 901 234', 'susan@email.com', 'member', '2019-06-01', 'SC', 'active', 32, 160000, 0),
    ('m8', new_chama_id, 'Robert Kimani Njoroge', '0789 012 345', 'robert@email.com', 'member', '2019-06-01', 'RK', 'active', 30, 150000, 0),
    ('m9', new_chama_id, 'Anne Wambui Kariuki', '0700 123 456', 'anne@email.com', 'member', '2019-07-15', 'AW', 'active', 28, 140000, 170000),
    ('m10', new_chama_id, 'John Mwenda Muthii', '0711 234 567', 'john@email.com', 'member', '2019-08-01', 'JM', 'inactive', 20, 100000, 0),
    ('m11', new_chama_id, 'Esther Auma Onyango', '0722 345 678', 'esther@email.com', 'member', '2020-01-15', 'EA', 'active', 26, 130000, 0),
    ('m12', new_chama_id, 'Samuel Njenga Waweru', '0733 456 789', 'samuel@email.com', 'member', '2020-03-01', 'SN', 'active', 24, 120000, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Seed contributions
  INSERT INTO contributions (id, chama_id, member_id, member_name, amount, date, month, type, status, mpesa_ref) VALUES
    ('c1', new_chama_id, 'm1', 'Grace Wanjiku Kamau', 5000, '2024-11-02', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X1'),
    ('c2', new_chama_id, 'm2', 'David Otieno Achieng', 5000, '2024-11-01', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X2'),
    ('c3', new_chama_id, 'm3', 'Faith Njeri Mwangi', 5000, '2024-11-03', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X3'),
    ('c4', new_chama_id, 'm4', 'James Kipchoge Rotich', 5000, '2024-11-02', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X4'),
    ('c5', new_chama_id, 'm5', 'Mary Akinyi Odhiambo', 5000, '2024-11-05', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X5'),
    ('c6', new_chama_id, 'm6', 'Peter Maina Githui', 5000, '2024-11-08', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X6'),
    ('c7', new_chama_id, 'm7', 'Susan Chebet Koech', 5000, '2024-11-10', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X7'),
    ('c8', new_chama_id, 'm8', 'Robert Kimani Njoroge', 5000, '2024-11-12', 'November 2024', 'monthly', 'pending', ''),
    ('c9', new_chama_id, 'm9', 'Anne Wambui Kariuki', 5000, '2024-11-01', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X9'),
    ('c10', new_chama_id, 'm10', 'John Mwenda Muthii', 5000, NULL, 'November 2024', 'monthly', 'overdue', ''),
    ('c11', new_chama_id, 'm11', 'Esther Auma Onyango', 5000, '2024-11-06', 'November 2024', 'monthly', 'paid', 'QHJ4K7P2X11'),
    ('c12', new_chama_id, 'm12', 'Samuel Njenga Waweru', 5000, NULL, 'November 2024', 'monthly', 'pending', '')
  ON CONFLICT (id) DO NOTHING;

  -- Seed loans
  INSERT INTO loans (id, chama_id, member_id, member_name, amount, interest, balance, disbursed_date, due_date, status, purpose) VALUES
    ('l1', new_chama_id, 'm2', 'David Otieno Achieng', 50000, 10, 22000, '2024-08-01', '2025-02-01', 'active', 'Business expansion - Mama Mboga stall'),
    ('l2', new_chama_id, 'm4', 'James Kipchoge Rotich', 80000, 10, 45000, '2024-07-15', '2025-01-15', 'active', 'School fees - Secondary school'),
    ('l3', new_chama_id, 'm6', 'Peter Maina Githui', 120000, 10, 77000, '2024-06-01', '2024-12-01', 'overdue', 'Motorcycle (Boda Boda) purchase'),
    ('l4', new_chama_id, 'm9', 'Anne Wambui Kariuki', 170000, 10, 170000, '2024-11-01', '2025-05-01', 'active', 'Real estate deposit - Apartment'),
    ('l5', new_chama_id, 'm7', 'Susan Chebet Koech', 30000, 10, 0, '2024-03-01', '2024-09-01', 'paid', 'Medical expenses')
  ON CONFLICT (id) DO NOTHING;

  -- Seed loan repayments
  INSERT INTO loan_repayments (id, chama_id, loan_id, amount, date, mpesa_ref) VALUES
    ('r1', new_chama_id, 'l1', 15000, '2024-09-01', 'LNR001X1'),
    ('r2', new_chama_id, 'l1', 13000, '2024-10-01', 'LNR001X2'),
    ('r3', new_chama_id, 'l2', 20000, '2024-08-15', 'LNR002X1'),
    ('r4', new_chama_id, 'l2', 15000, '2024-09-15', 'LNR002X2'),
    ('r5', new_chama_id, 'l3', 25000, '2024-07-01', 'LNR003X1'),
    ('r6', new_chama_id, 'l3', 18000, '2024-08-01', 'LNR003X2'),
    ('r7', new_chama_id, 'l5', 15000, '2024-05-01', 'LNR005X1'),
    ('r8', new_chama_id, 'l5', 18000, '2024-08-15', 'LNR005X2')
  ON CONFLICT (id) DO NOTHING;

  -- Seed meetings
  INSERT INTO meetings (id, chama_id, title, date, time, venue, status, agenda, minutes, attendees) VALUES
    ('meet1', new_chama_id, 'November Monthly Meeting', '2024-11-02', '10:00 AM', 'Grace''s Home, Westlands', 'completed',
      ARRAY['Opening prayer', 'Roll call & apologies', 'Treasurer''s report', 'Loan applications review', 'Investment proposal - Treasury Bills', 'AOB'],
      'Meeting opened with a prayer by Grace Wanjiku at 10:15 AM. 11 members present, 1 apology from John Mwenda. Treasurer David reported a healthy fund balance of KSh 1,847,500. Three loan applications reviewed: Anne Wambui approved for KSh 170,000 for real estate deposit. Investment proposal to put KSh 500,000 in 91-day Treasury Bills discussed and approved with 9 votes.',
      ARRAY['m1','m2','m3','m4','m5','m6','m7','m8','m9','m11','m12']),
    ('meet2', new_chama_id, 'December Monthly Meeting', '2024-12-07', '10:00 AM', 'David''s Office, CBD', 'upcoming',
      ARRAY['Opening prayer', 'Roll call & apologies', 'Treasurer''s report', 'Review T-Bill investment returns', 'End-year party planning', 'Christmas welfare contributions', 'AOB'],
      '', ARRAY[]::TEXT[]),
    ('meet3', new_chama_id, 'Emergency Meeting - Investment Review', '2024-10-15', '6:00 PM', 'Zoom Online', 'completed',
      ARRAY['Review of property investment proposal', 'Legal due diligence report', 'Vote on Ruiru plot acquisition'],
      'Emergency zoom meeting called by the chairperson. 9 members attended. Legal team presented due diligence on the Ruiru 1/2 acre plot.',
      ARRAY['m1','m2','m3','m4','m5','m6','m7','m9','m11'])
  ON CONFLICT (id) DO NOTHING;

  RETURN new_chama_id;
END;
$$;

-- 4. ROW LEVEL SECURITY

-- Chamas RLS
ALTER TABLE chamas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own chama" ON chamas;
CREATE POLICY "Users can view own chama" ON chamas
  FOR SELECT USING (user_has_chama_access(id));
DROP POLICY IF EXISTS "Admin can update own chama" ON chamas;
CREATE POLICY "Admin can update own chama" ON chamas
  FOR UPDATE USING (is_chama_admin(id)) WITH CHECK (is_chama_admin(id));

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admin can view chama profiles" ON profiles;
CREATE POLICY "Admin can view chama profiles" ON profiles
  FOR SELECT USING (is_chama_admin(chama_id));

-- Members RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access members" ON members;
CREATE POLICY "Admin full access members" ON members
  FOR ALL USING (is_chama_admin(chama_id));
DROP POLICY IF EXISTS "Member view own" ON members;
CREATE POLICY "Member view own" ON members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND member_id = members.id)
  );

-- Contributions RLS
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access contributions" ON contributions;
CREATE POLICY "Admin full access contributions" ON contributions
  FOR ALL USING (is_chama_admin(chama_id));
DROP POLICY IF EXISTS "Member view own contributions" ON contributions;
CREATE POLICY "Member view own contributions" ON contributions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND member_id = contributions.member_id)
  );

-- Loans RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access loans" ON loans;
CREATE POLICY "Admin full access loans" ON loans
  FOR ALL USING (is_chama_admin(chama_id));
DROP POLICY IF EXISTS "Member view own loans" ON loans;
CREATE POLICY "Member view own loans" ON loans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND member_id = loans.member_id)
  );

-- Loan Repayments RLS
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access repayments" ON loan_repayments;
CREATE POLICY "Admin full access repayments" ON loan_repayments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM loans l WHERE l.id = loan_repayments.loan_id AND is_chama_admin(l.chama_id))
  );
DROP POLICY IF EXISTS "Member view own repayments" ON loan_repayments;
CREATE POLICY "Member view own repayments" ON loan_repayments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM loans l WHERE l.id = loan_repayments.loan_id AND EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND member_id = l.member_id
    ))
  );

-- Meetings RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Chama members view meetings" ON meetings;
CREATE POLICY "Chama members view meetings" ON meetings
  FOR SELECT USING (user_has_chama_access(chama_id));
DROP POLICY IF EXISTS "Admin full access meetings" ON meetings;
CREATE POLICY "Admin full access meetings" ON meetings
  FOR ALL USING (is_chama_admin(chama_id));

-- Push subscriptions RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Transactions RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access transactions" ON transactions;
CREATE POLICY "Admin full access transactions" ON transactions
  FOR ALL USING (is_chama_admin(chama_id));

-- Audit logs RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access audit_logs" ON audit_logs;
CREATE POLICY "Admin full access audit_logs" ON audit_logs
  FOR ALL USING (is_chama_admin(chama_id));

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_members_chama ON members(chama_id);
CREATE INDEX IF NOT EXISTS idx_contributions_chama ON contributions(chama_id);
CREATE INDEX IF NOT EXISTS idx_loans_chama ON loans(chama_id);
CREATE INDEX IF NOT EXISTS idx_meetings_chama ON meetings(chama_id);
CREATE INDEX IF NOT EXISTS idx_profiles_chama ON profiles(chama_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_chama ON loan_repayments(chama_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_transactions_chama ON transactions(chama_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_chama ON audit_logs(chama_id);
