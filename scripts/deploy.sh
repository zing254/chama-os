#!/bin/bash
set -e

echo "=== ChamaOS Production Deployment ==="
echo ""

# 1. Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install: npm install -g supabase"
  exit 1
fi

if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Install: npm install -g vercel"
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "❌ .env.local not found. Copy .env.example to .env.local and fill in your keys."
  exit 1
fi

echo "✅ Prerequisites met"
echo ""

# 2. Apply SQL migration
echo "🗄️  Applying SQL migration..."
supabase db push || supabase sql < supabase/migration-multi-tenant.sql
echo "✅ Migration applied"
echo ""

# 3. Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
supabase functions deploy invite-member --no-verify-jwt
supabase functions deploy stripe-checkout --no-verify-jwt
supabase functions deploy mpesa-stkpush --no-verify-jwt
echo "✅ Edge Functions deployed"
echo ""

# 4. Set Edge Function secrets
echo "🔐 Setting Edge Function secrets..."
supabase secrets set MPESA_CONSUMER_KEY="$VITE_MPESA_CONSUMER_KEY"
supabase secrets set MPESA_CONSUMER_SECRET="$VITE_MPESA_CONSUMER_SECRET"
supabase secrets set MPESA_PASSKEY="$VITE_MPESA_PASSKEY"
supabase secrets set MPESA_SHORTCODE="$VITE_MPESA_SHORTCODE"
supabase secrets set MPESA_ENV="$VITE_MPESA_ENV"
supabase secrets set VITE_STRIPE_SECRET_KEY="$VITE_STRIPE_SECRET_KEY"
supabase secrets set PUBLIC_SITE_URL="$VITE_APP_URL"
echo "✅ Secrets set"
echo ""

# 5. Build
echo "🏗️  Building..."
npm run build
echo "✅ Build complete"
echo ""

# 6. Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod --yes
echo "✅ Vercel deployment complete"
echo ""

echo "=== Deployment Complete! ==="
echo "Next steps:"
echo "  1. Verify signup flow works at your Vercel URL"
echo "  2. Test M-Pesa STK Push from the Pricing page"
echo "  3. Invite a test member from User Management"
echo "  4. Test member login with the invited email"
