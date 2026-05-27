# ChamaOS — Manual Setup Guide

## Production URL: https://chama-os.vercel.app

> Everything that could be automated is done. These are the steps **you** must complete manually.

---

## 1. Stripe Payments Setup (30 min)

### Get Stripe API Keys
1. Go to https://dashboard.stripe.com/register — create account (or login)
2. Navigate to **Developers → API Keys** (https://dashboard.stripe.com/apikeys)
3. Copy **Publishable Key** (starts with `pk_`)
4. Copy **Secret Key** (starts with `sk_`)

### Set Keys
```bash
# In your terminal (from project root):

# 1. Add to Vercel (required for frontend to load Stripe.js)
npx vercel env add VITE_STRIPE_PUBLISHABLE_KEY production

# 2. Add to Supabase (required for Edge Function to create Checkout Sessions)
supabase secrets set VITE_STRIPE_SECRET_KEY=sk_live_xxx
```

### Create Stripe Price IDs
In Stripe Dashboard → **Products** → **Add Product** for each plan:

| Plan | Price (KSh/month) | Price ID |
|------|-------------------|----------|
| Starter | 1,999 | `price_starter_monthly` |
| Pro | 4,999 | `price_pro_monthly` |
| Enterprise | 9,999 | `price_enterprise_monthly` |

- Create each as a **Recurring** product, **Monthly** billing
- In `supabase/functions/stripe-checkout/index.ts` line 9-13, replace the `price_xxx` placeholders with your real Price IDs

---

## 2. M-Pesa Daraja API Setup (1-2 hours)

### Register as a Safaricom Developer
1. Go to https://developer.safaricom.co.ke
2. Click **Register** → create account (requires Safaricom SIM)
3. Verify via OTP sent to your Safaricom number

### Create an App
1. Log in → **My Apps** → **Create an App**
2. App Name: `ChamaOS`
3. Select APIs: **M-Pesa** (all scopes)
4. Copy **Consumer Key** and **Consumer Secret**

### Get Passkey
1. In the same app page, find **Passkey** (or generate one via Lipa Na M-Pesa Online)
2. Copy the passkey (base64 string)

### Set Keys
```bash
supabase secrets set \
  MPESA_CONSUMER_KEY=your_consumer_key \
  MPESA_CONSUMER_SECRET=your_consumer_secret \
  MPESA_PASSKEY=your_passkey \
  MPESA_SHORTCODE=174379 \
  MPESA_ENV=production
```

### Set M-Pesa Callback URL (Production Only)
1. In Safaricom Developer Portal → your app → **Lipa Na M-Pesa Online**
2. Set **CallBackURL** to: `https://chama-os.vercel.app/api/mpesa-callback`
   - Note: You'll need a proper server endpoint for this. Currently the app doesn't have a callback handler on Vercel. For production, create a serverless function at `api/mpesa-callback.ts` or deploy a dedicated endpoint.
3. Set **ConfirmationURL** and **ValidationURL** appropriately

### Go Live Checklist
- [ ] Test in sandbox first (default `MPESA_ENV=sandbox`)
- [ ] Switch `MPESA_ENV=production` once tested
- [ ] Ensure your Paybill/Till number has Lipa Na M-Pesa Online enabled
- [ ] Callback URL must be HTTPS and publicly accessible

---

## 3. Custom Domain (Optional, 1 hour)

### Link Your Domain
```bash
npx vercel domains add yourdomain.com --scope zing254s-projects
```

### DNS Configuration
In your domain registrar's DNS settings, add:

| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `@` (root) | `cname.vercel-dns.com` (if supported) |

Or for apex domains, use Vercel's nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

### Update URLs After Domain
```bash
supabase secrets set PUBLIC_SITE_URL=https://yourdomain.com

# Re-deploy
npm run build && npx vercel --prod --yes
```

---

## 4. Google OAuth Setup (Optional, 30 min)

1. Go to https://console.cloud.google.com → **APIs & Services** → **Credentials**
2. Create OAuth consent screen (External)
3. Create OAuth 2.0 Client ID (Web application)
4. Add Authorized redirect URI:
   `https://oriayiuaucsldkledjqt.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. In Supabase Dashboard → **Authentication** → **Providers** → **Google** → enable, paste keys

---

## 5. Email Configuration (Optional)

By default, Supabase sends emails from `noreply@supabase.co`. For production branding:

1. Supabase Dashboard → **Authentication** → **Settings**
2. Under **SMTP Settings**, enable Custom SMTP
3. Configure your SMTP provider (SendGrid, Mailgun, etc.)
4. Update sender email to `noreply@yourdomain.com`

---

## 6. Verify Everything Works

Test these flows in order:

1. **Signup**: https://chama-os.vercel.app/signup
   - Create account with email + password + chama name
   - Check email for confirmation link

2. **Admin Dashboard**: After login, you should see 12 seed members + contributions + loans + meetings

3. **Invite Member**: Admin → User Management → Invite
   - Enter a real email → "Send Invite"
   - Check that the Edge Function runs (check Supabase Function logs)

4. **Member Login**: Use the invited email's magic link
   - Verify member dashboard shows only that member's data

5. **Payments** (if Stripe/M-Pesa configured):
   - Go to Pricing → try M-Pesa (STK Push to your phone)
   - Try Stripe card payment

---

## Appendix: Useful Commands

```bash
# Deploy after code changes
npm run build && npx vercel --prod --yes

# Update Supabase Edge Functions
supabase functions deploy <function-name> --no-verify-jwt

# View Supabase Function logs
supabase functions serve <function-name>

# Apply new database migrations
echo "YOUR_SQL_HERE" | supabase db query --linked

# Reset local .env.local
cp .env.example .env.local
```
