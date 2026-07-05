# ChamaOS

**Stack:** React 19 + Vite 7 + TypeScript + Tailwind v4 + Supabase + Stripe + Resend
**Production:** https://chama-os.vercel.app
**Supabase:** https://supabase.com/dashboard/project/oriayiuaucsldkledjqt
**OPS.md:** Full operations guide — monitoring, deploy, secrets, troubleshooting

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Produces single `dist/index.html` (~1.1MB, all JS/CSS inlined via `vite-plugin-singlefile`) |
| `npm test` | Vitest (jsdom), **41 tests across 10 files** |
| `npm run typecheck` | TypeScript check — **0 errors** |
| `npm run lint` | ESLint (unused imports) |
| `npx vercel --prod --yes` | Deploy frontend (project: `chama-os`, org: `zing254s-projects`) |
| `npx vercel alias set <dep-url> chama-os.vercel.app` | Point production alias after deploy |

## Architecture

- **Entry:** `src/main.tsx` → `src/App.tsx` (BrowserRouter, all providers nested)
- **Auth:** `src/data/auth-context.tsx` — Supabase real auth (not localStorage). Signup triggers `seed_chama` RPC. Has forgot/reset password methods
- **Data:** `src/data/context.tsx` — full CRUD (members, contributions, loans + repayments), filtered by `chamaId`
- **Routing:** All routes lazy-loaded in `App.tsx`. Every route wrapped in `<ErrorBoundary>` + `<RoutePage>` (dynamic titles)
- **i18n:** `src/data/i18n.ts` — EN + SW. Swahili tested for completeness
- **Constants:** `src/data/constants.ts` — `DEFAULT_MONTHLY_CONTRIBUTION`, `MPESA_NUMBER`, `PLAN_PRICES`, `PLAN_LIMITS`
- **`@/`** path alias maps to `src/` (configured in both vite.config.ts and tsconfig.json)
- **`cn()`** from `src/utils/cn.ts` (clsx + tailwind-merge) — always use this, not `./cn`

## Supabase

- **Project:** `oriayiuaucsldkledjqt` (already linked via `supabase link`)
- **Client:** `src/data/supabase.ts` — throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing. No fallback
- **.env.local** has real creds — DO NOT commit (gitignored). `.env.example` has placeholders
- **Migration:** `supabase/migration-multi-tenant.sql` — full schema (14 tables). Use `CREATE TABLE IF NOT EXISTS` sections for new tables only (NOT the full migration — date cast on line 188 fails on existing DB)
- **New tables:** `notifications`, `user_settings` (added 2026-07-05)

### Edge Functions (6 total)

All deployed with `--no-verify-jwt`. CORS headers present. Secrets read at runtime via `Deno.env.get()` — must redeploy after changing secrets.

| Function | Purpose | Requires |
|---|---|---|
| `invite-member` | Email invite via Supabase Admin API | `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL` |
| `stripe-checkout` | Stripe Checkout session | `VITE_STRIPE_SECRET_KEY`, real price IDs |
| `stripe-webhook` | Listens for `checkout.session.completed` etc | `VITE_STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `send-email` | Resend API transactional emails | `RESEND_API_KEY` |
| `send-push` | VAPID-signed push notifications (encrypted) | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| `mpesa-stkpush` | M-Pesa STK Push (kept for future) | M-Pesa Daraja credentials |

Deploy: `supabase functions deploy <name> --no-verify-jwt`

### Edge Function Secrets

```
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  VITE_STRIPE_SECRET_KEY=sk_test_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  PUBLIC_SITE_URL=https://chama-os.vercel.app \
  VAPID_PUBLIC_KEY=BLK3... \
  VAPID_PRIVATE_KEY=K8Cc...
```

M-Pesa secrets (`MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_ENV`) have placeholder digests — not needed for manual M-Pesa flow.

## Stripe (test mode — not live)

- **Publishable key:** `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel env (frontend Stripe.js)
- **Secret key:** `VITE_STRIPE_SECRET_KEY` in Supabase secrets (edge functions)
- **Webhook secret:** `STRIPE_WEBHOOK_SECRET` in Supabase secrets
- **Real price IDs** in `supabase/functions/stripe-checkout/index.ts`:
  - Starter: `price_1Tbox4GcXpG5kzwDEeo7L1Ow` (KSh 1,999/mo)
  - Pro: `price_1Tbox6GcXpG5kzwDsiK6jMyB` (KSh 4,999/mo)
  - Enterprise: `price_1Tbox8GcXpG5kzwDouIYZlg6` (KSh 9,999/mo)
- Webhook events: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`

## Payment Flow

**M-Pesa is manual only** — members send to `0797 132 940`, admin records. STK Push code kept for future in `src/data/mpesa.ts` and `supabase/functions/mpesa-stkpush/index.ts`. Do not remove or modify either.

## Key Gotchas

- **Stale secrets:** Setting a Supabase secret does NOT update the running function — must `supabase functions deploy` for changes to take effect
- **Vercel alias:** After `vercel --prod --yes`, the production URL changes. Must manually run `npx vercel alias set <new-url> chama-os.vercel.app`
- **send-email `from`:** Changed to `noreply@chamaos.kesug.com` — won't send until domain verified on Resend
- **Supabase auto-pause:** Free project auto-pauses after 7 days inactivity. Unpause in dashboard. Edge functions return "INACTIVE" status
- **Testing:** `Login.test.tsx` mocks `auth-context` and `react-router-dom`. Must wrap in `<BrowserRouter>` and mock `AuthProvider`
- **AdminLogin race:** `src/components/admin/AdminLogin.tsx` checks admin role via `supabase.auth.getUser()` + profiles query after `signIn()` — do not simplify
- **Build time:** ~10-15s due to single-file inlining
- **Full migration SQL:** Line 188 has `founded ~ '^\d{4}$'` which fails if `founded` column is already DATE type. Run only `CREATE TABLE IF NOT EXISTS` for new tables
- **OPS.md** has full operations, monitoring, and troubleshooting guide

## Current State (2026-07-05)

- All 27 completion tasks committed (`5309c641`)
- Build ✅ Tests 41/41 ✅ Typecheck 0 errors ✅
- Site live at https://chama-os.vercel.app
- Supabase project ACTIVE, all 6 edge functions deployed
- Stripe in test mode (activate account for live)
- Resend domain `chamaos.kesug.com` pending DNS verification
