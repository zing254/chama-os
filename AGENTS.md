# ChamaOS

**Stack:** React 19 + Vite 7 + TypeScript + Tailwind v4 + Supabase + Stripe + Resend
**Supabase:** https://supabase.com/dashboard/project/oriayiuaucsldkledjqt
**Production:** https://chama-os.vercel.app
**Operations:** `OPS.md` — deploy, secrets, monitoring, troubleshooting

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Produces **single** `dist/index.html` (~1.1MB, all JS/CSS inlined via `vite-plugin-singlefile`) |
| `npm test` | Vitest (jsdom), 41 tests across 10 files |
| `npm run typecheck` | `tsc --noEmit` — should be 0 errors |
| `npm run lint` | ESLint (unused imports rule) |
| `npx vercel --prod --yes` | Deploy frontend |
| `npx vercel alias set <url> chama-os.vercel.app` | **Required after every deploy** — Vercel changes URL each time |

## Gotchas

- **Supabase secrets + edge functions:** Setting a secret does NOT update the running function. Always run `supabase functions deploy <name> --no-verify-jwt` afterward, or the old code still runs with the old secrets.
- **Vercel alias:** After `vercel --prod --yes`, the URL changes. Must re-run `npx vercel alias set <new-url> chama-os.vercel.app` or the prod alias breaks.
- **Migration SQL:** `supabase/migration-multi-tenant.sql` line 188 has `founded ~ '^\d{4}$'` which fails if the `founded` column is already `DATE` type. Run only `CREATE TABLE IF NOT EXISTS` sections — never the full file on an existing DB.
- **AdminLogin race:** `src/components/admin/AdminLogin.tsx` calls `signIn()` then checks `supabase.auth.getUser()` + profiles query to verify admin role. Do not simplify — the role check must happen post-login.
- **Testing:** `Login.test.tsx` mocks `auth-context` and `react-router-dom`. Must wrap in `<BrowserRouter>` and mock `AuthProvider`. Other test files follow similar patterns.
- **Supabase auto-pause:** Free tier pauses after 7 days inactivity. Unpause in dashboard. Edge functions return 404 "INACTIVE" while paused.
- **send-email `from`:** Currently `noreply@chamaos.kesug.com` — won't send until domain verified in Resend dashboard.
- **M-Pesa is manual only:** Members send to `0797 132 940`, admin records it. The STK Push code in `src/data/mpesa.ts` and `supabase/functions/mpesa-stkpush/` must NOT be removed or modified — kept for future automation.

## Architecture

- **Entry:** `src/main.tsx` → `src/App.tsx` (BrowserRouter + all providers nested)
- **Auth:** `src/data/auth-context.tsx` — real Supabase auth (not localStorage). Has signup/login/forgot/reset password methods
- **Data:** `src/data/context.tsx` — full CRUD (members, contributions, loans + repayments), filtered by `chamaId` via React context
- **Routing:** Routes lazy-loaded in `App.tsx`. Each route wrapped in `<ErrorBoundary>` + `<RoutePage>` (dynamic page titles)
- **i18n:** `src/data/i18n.ts` — EN + SW (163 keys each, tested for completeness)
- **Constants:** `src/data/constants.ts` — `DEFAULT_MONTHLY_CONTRIBUTION`, `MPESA_NUMBER`, `PLAN_PRICES`, `PLAN_LIMITS`
- **`@/`** aliases to `src/` (vite.config.ts + tsconfig.json)
- **`cn()`** from `src/utils/cn.ts` (clsx + tailwind-merge) — use this, never `./cn`

## Edge Functions (6 total)

Deploy command: `supabase functions deploy <name> --no-verify-jwt`

| Function | Purpose | Requires |
|---|---|---|
| `invite-member` | Email invite via Supabase Admin API | `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL` |
| `stripe-checkout` | Stripe Checkout session | `VITE_STRIPE_SECRET_KEY` |
| `stripe-webhook` | Listens for checkout/subscription events | `VITE_STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `send-email` | Resend transactional emails | `RESEND_API_KEY` |
| `send-push` | VAPID-signed encrypted push notifications | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| `mpesa-stkpush` | STK Push to member phones (future) | M-Pesa Daraja credentials |
| `whatsapp-webhook` | Inbound WhatsApp handler (M-Pesa, voice, commands) | `VITE_GEMINI_API_KEY`, `AT_USERNAME`, `AT_API_KEY`, `AT_SHORTCODE` |
| `ai-auditor` | Weekly Sunday audit summary sent via WhatsApp | `VITE_GEMINI_API_KEY`, `AT_USERNAME`, `AT_API_KEY`, `CRON_SECRET` |

## Cron (pg_cron)

| Job | Schedule | Calls |
|---|---|---|
| `ai-auditor-weekly` | Every Sunday 08:00 EAT (`0 8 * * 0`) | `POST /functions/v1/ai-auditor` with `x-cron-secret` header |

## WhatsApp Tables

- `whatsapp_sessions` — WA sessions linked to members/chamas (`wa_id`, `user_id`, `member_id`, `chama_id`, `state`, `context`)
- `whatsapp_messages` — Inbound/outbound message log (`session_id`, `chama_id`, `direction`, `message_type`, `content`, `media_url`)
- `minutes_archive` — Voice note minutes (`chama_id`, `created_by`, `title`, `summary`, `decisions`, `action_items`, `transcript`)

## API Routes (Vercel)

| Route | Purpose |
|---|---|
| `api/mpesa-callback.ts` | M-Pesa STK Push callback |
| `api/loan-risk.ts` | Gemini-powered loan default risk analyzer (`GET ?memberId=X&memberName=Y`) |

## Stripe (test mode)

- Real price IDs in `supabase/functions/stripe-checkout/index.ts` (Starter KSh 1,999, Pro KSh 4,999, Enterprise KSh 9,999)
- Webhook listens for: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted/updated`
- Webhook endpoint: `https://oriayiuaucsldkledjqt.supabase.co/functions/v1/stripe-webhook`
