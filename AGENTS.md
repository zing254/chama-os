# ChamaOS

**Stack:** React 19 + Vite 7 + TypeScript + Tailwind v4 + Supabase + Stripe + Resend
**Production:** https://chama-os.vercel.app

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Produces single `dist/index.html` (~1.1MB, all JS/CSS inlined via `vite-plugin-singlefile`) |
| `npm test` | Vitest (jsdom), 19 tests across 5 files |
| `npx vercel --prod --yes` | Deploy frontend (project: `chama-os`, org: `zing254s-projects`) |
| `npx vercel alias set <dep-url> chama-os.vercel.app` | Point production alias after deploy |

No lint or typecheck scripts exist. `tsconfig.json` has `noUnusedLocals: false` and `noUnusedParameters: false`.

## Architecture

- **Entry:** `src/main.tsx` → `src/App.tsx` (BrowserRouter, all providers nested)
- **Auth:** `src/data/auth-context.tsx` — Supabase real auth (not localStorage). Signup triggers `seed_chama` RPC
- **Data:** `src/data/context.tsx` — all CRUD via Supabase, filtered by `chamaId`
- **Routing:** All routes lazy-loaded in `App.tsx`. Every route wrapped in `<ErrorBoundary>` + `<RoutePage>` (dynamic titles)
- **i18n:** `src/data/i18n.ts` — EN + SW. Swahili tested for completeness
- **Constants:** `src/data/constants.ts` — `DEFAULT_MONTHLY_CONTRIBUTION`, `MPESA_NUMBER`, `PLAN_PRICES`, etc.
- **`@/`** path alias maps to `src/` (configured in both vite.config.ts and tsconfig.json)
- **`cn()`** from `src/utils/cn.ts` (clsx + tailwind-merge) — always use this, not `./cn`

## Supabase

- **Project:** `oriayiuaucsldkledjqt` (already linked via `supabase link`)
- **Client:** `src/data/supabase.ts` — throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing. No fallback
- **.env.local** has real creds — DO NOT commit (gitignored). `.env.example` has placeholders
- **Migration:** `supabase/migration-multi-tenant.sql` — full schema. Note `push_subscriptions` RLS uses `auth.uid() = user_id` (no cast needed; `user_id` column is `UUID REFERENCES auth.users(id)`)
- **Re-apply migration:** `cat supabase/migration-multi-tenant.sql | supabase db query --linked`

### Edge Functions (5 total)

All deployed with `--no-verify-jwt`. CORS headers present. Secrets read at runtime via `Deno.env.get()` — must redeploy after changing secrets.

| Function | Purpose | Requires |
|---|---|---|
| `invite-member` | Email invite via Supabase Admin API | `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL` |
| `stripe-checkout` | Stripe Checkout session | `VITE_STRIPE_SECRET_KEY` (`sk_test_`), real price IDs |
| `mpesa-stkpush` | M-Pesa STK Push (kept for future) | M-Pesa Daraja credentials |
| `send-email` | Resend API transactional emails | `RESEND_API_KEY` |
| `stripe-webhook` | Listens for `checkout.session.completed` | `VITE_STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

Deploy: `supabase functions deploy <name> --no-verify-jwt`

### Edge Function Secrets

```
supabase secrets set RESEND_API_KEY=re_xxx VITE_STRIPE_SECRET_KEY=sk_test_xxx PUBLIC_SITE_URL=https://chama-os.vercel.app
```

M-Pesa secrets (`MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_ENV`) have placeholder digests — not needed for manual M-Pesa flow.

## Stripe (active — test mode)

- **Publishable key:** `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel env (for frontend Stripe.js)
- **Secret key:** `VITE_STRIPE_SECRET_KEY` in Supabase secrets (for Edge Functions)
- **Real price IDs** in `supabase/functions/stripe-checkout/index.ts`:
  - Starter: `price_1Tbox4GcXpG5kzwDEeo7L1Ow` (KSh 1,999/mo)
  - Pro: `price_1Tbox6GcXpG5kzwDsiK6jMyB` (KSh 4,999/mo)
  - Enterprise: `price_1Tbox8GcXpG5kzwDouIYZlg6` (KSh 9,999/mo)
- Pricing.tsx button now active (was "Coming Soon")

## Payment Flow

**M-Pesa is manual only** — members send to `0797 132 940`, admin records. STK Push code kept for future in `src/data/mpesa.ts` and `supabase/functions/mpesa-stkpush/index.ts`. Do not remove or modify either.

## Key Gotchas

- **Stale secrets:** Setting a Supabase secret does NOT update the running function — must `supabase functions deploy` for changes to take effect
- **Vercel alias:** After `vercel --prod --yes`, the production URL changes. Must manually run `npx vercel alias set <new-url> chama-os.vercel.app`
- **send-email `from`:** Currently `onboarding@resend.dev` (Resend test mode). Change to your verified domain once added at https://resend.com/domains
- **Testing:** `Login.test.tsx` mocks `auth-context` and `react-router-dom`. Must wrap in `<BrowserRouter>` and mock `AuthProvider`
- **AdminLogin race:** `src/components/admin/AdminLogin.tsx` checks admin role via `supabase.auth.getUser()` + profiles query after `signIn()` — do not simplify
- **Build time:** ~10-15s due to single-file inlining
- **MANUAL_SETUP.md** has Stripe/M-Pesa/domain steps — reference it instead of duplicating

## Fixes Applied

These corrections have been made to address issues found during codebase audit:

- **Edge function auth checks:** All edge functions (`stripe-checkout`, `invite-member`, `send-email`, `mpesa-stkpush`) verify the caller's JWT via `Authorization` header + `supabase.auth.getUser()` before processing requests. `stripe-webhook` uses Stripe signature verification (`stripe-signature` header + `STRIPE_WEBHOOK_SECRET`) instead of JWT auth.
- **stripe-webhook requires webhook secret:** The function reads `STRIPE_WEBHOOK_SECRET` from secrets and calls `stripe.webhooks.constructEvent()` to verify request authenticity — requests without a valid signature are rejected with 401.
- **push_subscriptions RLS:** The RLS policy uses `auth.uid() = user_id` — both values are UUID type (no cast needed). The `user_id` column is defined as `UUID REFERENCES auth.users(id)` in the migration. This was previously misdocumented as requiring a `text` cast.
- **send-email rate limiting:** The function implements in-memory rate limiting (10 requests per 60-second window per user) and falls back to a simulated response when `RESEND_API_KEY` is not configured.
- **invite-member admin check:** The function verifies the caller has an admin role for the target chama (`profiles.role = 'admin'`) before sending invites — non-admin callers receive a 403 response.
- **stripe-webhook duplicate event handling:** Uses an in-memory `Set<string>` to track processed event IDs and prevent duplicate processing.
