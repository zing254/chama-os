export type Member = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'chairman' | 'treasurer' | 'secretary' | 'member';
  joinDate: string;
  avatar: string;
  status: 'active' | 'inactive';
  shares: number;
  totalContributed: number;
  totalLoans: number;
};

export type Contribution = {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  month: string;
  type: 'monthly' | 'shares' | 'fine' | 'special';
  status: 'paid' | 'pending' | 'overdue';
  mpesaRef: string;
};

export type Loan = {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  interest: number;
  balance: number;
  disbursedDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue' | 'pending';
  repayments: LoanRepayment[];
  purpose: string;
};

export type LoanRepayment = {
  id: string;
  amount: number;
  date: string;
  mpesaRef: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  agenda: string[];
  minutes: string;
  attendees: string[];
};

export type Transaction = {
  id: string;
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'fine' | 'investment';
  description: string;
  amount: number;
  date: string;
  memberId: string;
  memberName: string;
  mpesaRef: string;
  balance: number;
};

export type Chama = {
  id: string;
  name: string;
  registrationNumber: string;
  founded: string;
  location: string;
  meetingSchedule: string;
  monthlyContribution: number;
  loanInterestRate: number;
  totalFund: number;
  totalMembers: number;
  totalLoansOut: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

export const chamaInfo: Chama = {
  id: 'chama-001',
  name: 'Umoja Wetu Investment Group',
  registrationNumber: 'KCH/2019/04521',
  founded: '2019-03-15',
  location: 'Nairobi, Westlands',
  meetingSchedule: 'Every 1st Saturday of the month',
  monthlyContribution: 5000,
  loanInterestRate: 10,
  totalFund: 1847500,
  totalMembers: 24,
  totalLoansOut: 420000,
  plan: 'starter',
};

export const members: Member[] = [
  { id: 'm1', name: 'Grace Wanjiku Kamau', phone: '0712 345 678', email: 'grace@email.com', role: 'chairman', joinDate: '2019-03-15', avatar: 'GW', status: 'active', shares: 45, totalContributed: 225000, totalLoans: 0 },
  { id: 'm2', name: 'David Otieno Achieng', phone: '0723 456 789', email: 'david@email.com', role: 'treasurer', joinDate: '2019-03-15', avatar: 'DO', status: 'active', shares: 42, totalContributed: 210000, totalLoans: 50000 },
  { id: 'm3', name: 'Faith Njeri Mwangi', phone: '0734 567 890', email: 'faith@email.com', role: 'secretary', joinDate: '2019-04-01', avatar: 'FN', status: 'active', shares: 40, totalContributed: 200000, totalLoans: 0 },
  { id: 'm4', name: 'James Kipchoge Rotich', phone: '0745 678 901', email: 'james@email.com', role: 'member', joinDate: '2019-04-01', avatar: 'JK', status: 'active', shares: 38, totalContributed: 190000, totalLoans: 80000 },
  { id: 'm5', name: 'Mary Akinyi Odhiambo', phone: '0756 789 012', email: 'mary@email.com', role: 'member', joinDate: '2019-05-15', avatar: 'MA', status: 'active', shares: 36, totalContributed: 180000, totalLoans: 0 },
  { id: 'm6', name: 'Peter Maina Githui', phone: '0767 890 123', email: 'peter@email.com', role: 'member', joinDate: '2019-05-15', avatar: 'PM', status: 'active', shares: 34, totalContributed: 170000, totalLoans: 120000 },
  { id: 'm7', name: 'Susan Chebet Koech', phone: '0778 901 234', email: 'susan@email.com', role: 'member', joinDate: '2019-06-01', avatar: 'SC', status: 'active', shares: 32, totalContributed: 160000, totalLoans: 0 },
  { id: 'm8', name: 'Robert Kimani Njoroge', phone: '0789 012 345', email: 'robert@email.com', role: 'member', joinDate: '2019-06-01', avatar: 'RK', status: 'active', shares: 30, totalContributed: 150000, totalLoans: 0 },
  { id: 'm9', name: 'Anne Wambui Kariuki', phone: '0700 123 456', email: 'anne@email.com', role: 'member', joinDate: '2019-07-15', avatar: 'AW', status: 'active', shares: 28, totalContributed: 140000, totalLoans: 170000 },
  { id: 'm10', name: 'John Mwenda Muthii', phone: '0711 234 567', email: 'john@email.com', role: 'member', joinDate: '2019-08-01', avatar: 'JM', status: 'inactive', shares: 20, totalContributed: 100000, totalLoans: 0 },
  { id: 'm11', name: 'Esther Auma Onyango', phone: '0722 345 678', email: 'esther@email.com', role: 'member', joinDate: '2020-01-15', avatar: 'EA', status: 'active', shares: 26, totalContributed: 130000, totalLoans: 0 },
  { id: 'm12', name: 'Samuel Njenga Waweru', phone: '0733 456 789', email: 'samuel@email.com', role: 'member', joinDate: '2020-03-01', avatar: 'SN', status: 'active', shares: 24, totalContributed: 120000, totalLoans: 0 },
];

export const contributions: Contribution[] = [
  { id: 'c1', memberId: 'm1', memberName: 'Grace Wanjiku Kamau', amount: 5000, date: '2024-11-02', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X1' },
  { id: 'c2', memberId: 'm2', memberName: 'David Otieno Achieng', amount: 5000, date: '2024-11-01', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X2' },
  { id: 'c3', memberId: 'm3', memberName: 'Faith Njeri Mwangi', amount: 5000, date: '2024-11-03', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X3' },
  { id: 'c4', memberId: 'm4', memberName: 'James Kipchoge Rotich', amount: 5000, date: '2024-11-02', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X4' },
  { id: 'c5', memberId: 'm5', memberName: 'Mary Akinyi Odhiambo', amount: 5000, date: '2024-11-05', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X5' },
  { id: 'c6', memberId: 'm6', memberName: 'Peter Maina Githui', amount: 5000, date: '2024-11-08', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X6' },
  { id: 'c7', memberId: 'm7', memberName: 'Susan Chebet Koech', amount: 5000, date: '2024-11-10', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X7' },
  { id: 'c8', memberId: 'm8', memberName: 'Robert Kimani Njoroge', amount: 5000, date: '2024-11-12', month: 'November 2024', type: 'monthly', status: 'pending', mpesaRef: '' },
  { id: 'c9', memberId: 'm9', memberName: 'Anne Wambui Kariuki', amount: 5000, date: '2024-11-01', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X9' },
  { id: 'c10', memberId: 'm10', memberName: 'John Mwenda Muthii', amount: 5000, date: '', month: 'November 2024', type: 'monthly', status: 'overdue', mpesaRef: '' },
  { id: 'c11', memberId: 'm11', memberName: 'Esther Auma Onyango', amount: 5000, date: '2024-11-06', month: 'November 2024', type: 'monthly', status: 'paid', mpesaRef: 'QHJ4K7P2X11' },
  { id: 'c12', memberId: 'm12', memberName: 'Samuel Njenga Waweru', amount: 5000, date: '', month: 'November 2024', type: 'monthly', status: 'pending', mpesaRef: '' },
];

export const loans: Loan[] = [
  {
    id: 'l1', memberId: 'm2', memberName: 'David Otieno Achieng', amount: 50000, interest: 10, balance: 22000,
    disbursedDate: '2024-08-01', dueDate: '2025-02-01', status: 'active', purpose: 'Business expansion - Mama Mboga stall',
    repayments: [
      { id: 'r1', amount: 15000, date: '2024-09-01', mpesaRef: 'LNR001X1' },
      { id: 'r2', amount: 13000, date: '2024-10-01', mpesaRef: 'LNR001X2' },
    ]
  },
  {
    id: 'l2', memberId: 'm4', memberName: 'James Kipchoge Rotich', amount: 80000, interest: 10, balance: 45000,
    disbursedDate: '2024-07-15', dueDate: '2025-01-15', status: 'active', purpose: 'School fees - Secondary school',
    repayments: [
      { id: 'r3', amount: 20000, date: '2024-08-15', mpesaRef: 'LNR002X1' },
      { id: 'r4', amount: 15000, date: '2024-09-15', mpesaRef: 'LNR002X2' },
    ]
  },
  {
    id: 'l3', memberId: 'm6', memberName: 'Peter Maina Githui', amount: 120000, interest: 10, balance: 77000,
    disbursedDate: '2024-06-01', dueDate: '2024-12-01', status: 'overdue', purpose: 'Motorcycle (Boda Boda) purchase',
    repayments: [
      { id: 'r5', amount: 25000, date: '2024-07-01', mpesaRef: 'LNR003X1' },
      { id: 'r6', amount: 18000, date: '2024-08-01', mpesaRef: 'LNR003X2' },
    ]
  },
  {
    id: 'l4', memberId: 'm9', memberName: 'Anne Wambui Kariuki', amount: 170000, interest: 10, balance: 170000,
    disbursedDate: '2024-11-01', dueDate: '2025-05-01', status: 'active', purpose: 'Real estate deposit - Apartment',
    repayments: []
  },
  {
    id: 'l5', memberId: 'm7', memberName: 'Susan Chebet Koech', amount: 30000, interest: 10, balance: 0,
    disbursedDate: '2024-03-01', dueDate: '2024-09-01', status: 'paid', purpose: 'Medical expenses',
    repayments: [
      { id: 'r7', amount: 15000, date: '2024-05-01', mpesaRef: 'LNR005X1' },
      { id: 'r8', amount: 18000, date: '2024-08-15', mpesaRef: 'LNR005X2' },
    ]
  },
];

export const meetings: Meeting[] = [
  {
    id: 'meet1', title: 'November Monthly Meeting', date: '2024-11-02', time: '10:00 AM', venue: 'Grace\'s Home, Westlands',
    status: 'completed', attendees: ['m1','m2','m3','m4','m5','m6','m7','m8','m9','m11','m12'],
    agenda: ['Opening prayer', 'Roll call & apologies', 'Treasurer\'s report', 'Loan applications review', 'Investment proposal - Treasury Bills', 'AOB'],
    minutes: 'Meeting opened with a prayer by Grace Wanjiku at 10:15 AM. 11 members present, 1 apology from John Mwenda. Treasurer David reported a healthy fund balance of KSh 1,847,500. Three loan applications reviewed: Anne Wambui approved for KSh 170,000 for real estate deposit. Investment proposal to put KSh 500,000 in 91-day Treasury Bills discussed and approved with 9 votes. Next meeting set for December 7, 2024.',
  },
  {
    id: 'meet2', title: 'December Monthly Meeting', date: '2024-12-07', time: '10:00 AM', venue: 'David\'s Office, CBD',
    status: 'upcoming', attendees: [],
    agenda: ['Opening prayer', 'Roll call & apologies', 'Treasurer\'s report', 'Review T-Bill investment returns', 'End-year party planning', 'Christmas welfare contributions', 'AOB'],
    minutes: '',
  },
  {
    id: 'meet3', title: 'Emergency Meeting - Investment Review', date: '2024-10-15', time: '6:00 PM', venue: 'Zoom Online',
    status: 'completed', attendees: ['m1','m2','m3','m4','m5','m6','m7','m9','m11'],
    agenda: ['Review of property investment proposal', 'Legal due diligence report', 'Vote on Ruiru plot acquisition'],
    minutes: 'Emergency zoom meeting called by the chairperson. 9 members attended. Legal team presented due diligence on the Ruiru 1/2 acre plot. After deliberation, members voted 7-2 against proceeding citing title deed concerns. Matter tabled pending further verification.',
  },
];

export const monthlyTrend = [
  { month: 'Jun', contributions: 55000, loans: 120000, interest: 8000 },
  { month: 'Jul', contributions: 58000, loans: 80000, interest: 9500 },
  { month: 'Aug', contributions: 60000, loans: 50000, interest: 12000 },
  { month: 'Sep', contributions: 60000, loans: 0, interest: 14000 },
  { month: 'Oct', contributions: 62000, loans: 0, interest: 15500 },
  { month: 'Nov', contributions: 60000, loans: 170000, interest: 16000 },
];

export const fundBreakdown = [
  { name: 'Cash in Bank', value: 1247500, color: '#16a34a' },
  { name: 'Active Loans', value: 420000, color: '#2563eb' },
  { name: 'Treasury Bills', value: 180000, color: '#7c3aed' },
];

export const plans = [
  {
    name: 'Free', price: 0, period: '/month', color: 'gray',
    features: ['Up to 10 members', 'Basic contributions tracking', 'Simple reports', 'Email support'],
    limits: 'No loan management, no M-Pesa, no meetings',
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Starter', price: 999, period: '/month', color: 'green',
    features: ['Up to 30 members', 'Full contributions tracking', 'Loan management', 'M-Pesa notifications', 'Meeting minutes', 'Monthly reports', 'SMS alerts'],
    limits: '',
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Pro', price: 2499, period: '/month', color: 'blue',
    features: ['Up to 100 members', 'Everything in Starter', 'Advanced analytics', 'Investment tracking', 'Multiple accounts', 'WhatsApp notifications', 'Priority support', 'Custom branding'],
    limits: '',
    cta: 'Go Pro',
    popular: false,
  },
  {
    name: 'Enterprise', price: 5999, period: '/month', color: 'purple',
    features: ['Unlimited members', 'Everything in Pro', 'Multi-chama management', 'API access', 'Dedicated account manager', 'Custom integrations', 'SACCO compliance reports', 'Audit trail'],
    limits: '',
    cta: 'Contact Sales',
    popular: false,
  },
];

let membersList = [...members];
let contributionsList = [...contributions];
let loansList = [...loans];
let meetingsList = [...meetings];

export function addMember(data: Omit<Member, 'id' | 'avatar' | 'status' | 'shares' | 'totalContributed' | 'totalLoans' | 'joinDate'>): Member {
  const newMember: Member = {
    ...data,
    id: `m${Date.now()}`,
    avatar: data.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
    status: 'active',
    shares: 0,
    totalContributed: 0,
    totalLoans: 0,
    joinDate: new Date().toISOString().split('T')[0],
  };
  membersList.push(newMember);
  return newMember;
}

export function addContribution(data: Omit<Contribution, 'id' | 'month' | 'mpesaRef'>): Contribution {
  const newContribution: Contribution = {
    ...data,
    id: `c${Date.now()}`,
    month: new Date().toLocaleString('en-KE', { month: 'long', year: 'numeric' }),
    mpesaRef: `MANUAL${Date.now().toString().slice(-6)}`,
  };
  contributionsList.push(newContribution);
  return newContribution;
}

export function addLoan(data: Omit<Loan, 'id' | 'balance' | 'disbursedDate' | 'dueDate' | 'status' | 'repayments'>): Loan {
  const disbursedDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const newLoan: Loan = {
    ...data,
    id: `l${Date.now()}`,
    balance: data.amount + (data.amount * data.interest / 100),
    disbursedDate,
    dueDate,
    status: 'pending',
    repayments: [],
  };
  loansList.push(newLoan);
  return newLoan;
}

export function addMeeting(data: Omit<Meeting, 'id' | 'status' | 'attendees' | 'minutes'>): Meeting {
  const newMeeting: Meeting = {
    ...data,
    id: `meet${Date.now()}`,
    status: 'upcoming',
    attendees: [],
    minutes: '',
  };
  meetingsList.push(newMeeting);
  return newMeeting;
}
