# ChamaOS — Operations Guide

**Site:** https://chama-os.vercel.app
**Supabase:** https://supabase.com/dashboard/project/oriayiuaucsldkledjqt
**GitHub:** https://github.com/zing254/chama-os

---

## 1. Daily / Weekly Checks (5 min)

### Supabase Dashboard → Logs
- **Edge Function logs** — Check for errors in any of the 6 functions
  ```
  supabase functions serve <name>  # or view in dashboard
  ```
- **Auth logs** — Failed sign-in attempts, unusual patterns
- **Database logs** — Slow queries, errors

### Vercel Dashboard
- **Deployment status** — Last deploy succeeded?
- **Analytics** — Traffic spikes, 404s, error rates
- **Environment variables** — Verify `VITE_*` vars are present

### Test the Site
Quick smoke test:
```
https://chama-os.vercel.app/signup  → page loads?
https://chama-os.vercel.app/login   → page loads?
```

---

## 2. How to Deploy

### Frontend (Vite + Vercel)
```bash
npm run build                    # Produces dist/index.html (~1.1 MB)
npx vercel --prod --yes          # Deploys to production
npx vercel alias set <new-url> chama-os.vercel.app  # Re-alias (needed every deploy)
```

### Edge Functions (Supabase)
```bash
# After changing code OR setting new secrets:
supabase functions deploy <name> --no-verify-jwt
# Names: invite-member, stripe-checkout, mpesa-stkpush, send-email, send-push, stripe-webhook, whatsapp-webhook, ai-auditor
```

### Database Migrations
```bash
# Apply SQL changes to production DB:
cat supabase/migration-multi-tenant.sql | supabase db query --linked
```

---

## 3. Managing Secrets

### Vercel Env Vars (for frontend)
```
npx vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_ANON_KEY production
npx vercel env add VITE_APP_URL production
npx vercel env add VITE_VAPID_PUBLIC_KEY production
```

### Supabase Secrets (for edge functions)
```
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  VITE_STRIPE_SECRET_KEY=sk_test_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  PUBLIC_SITE_URL=https://chama-os.vercel.app \
  VAPID_PUBLIC_KEY=xxx \
  VAPID_PRIVATE_KEY=xxx \
  VITE_GEMINI_API_KEY=xxx \
  AT_USERNAME=sandbox \
  AT_API_KEY=xxx \
  AT_SHORTCODE=7231 \
  CRON_SECRET=xxx
```

**Critical:** Setting a secret does NOT update the running function. You MUST also:
```
supabase functions deploy <name> --no-verify-jwt
```

---

## 4. Edge Function Reference (8 total)

| Function | URL | Triggered by | Requires |
|----------|-----|--------------|----------|
| `invite-member` | `.../invite-member` | Admin → User Management → Invite | `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL` |
| `stripe-checkout` | `.../stripe-checkout` | Pricing page → Subscribe button | `VITE_STRIPE_SECRET_KEY` |
| `stripe-webhook` | `.../stripe-webhook` | Stripe events (checkout, invoice, subscription) | `VITE_STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `send-email` | `.../send-email` | Admin → Send Notification | `RESEND_API_KEY` |
| `send-push` | `.../send-push` | Browser push notification events | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| `mpesa-stkpush` | `.../mpesa-stkpush` | (Future — STK Push to member phones) | M-Pesa Daraja credentials |
| `whatsapp-webhook` | `.../whatsapp-webhook` | Inbound WhatsApp messages from Africa's Talking | `VITE_GEMINI_API_KEY`, `AT_USERNAME`, `AT_API_KEY`, `AT_SHORTCODE` |
| `ai-auditor` | `.../ai-auditor` | Weekly Sunday cron (`0 8 * * 0`) | `VITE_GEMINI_API_KEY`, `AT_USERNAME`, `AT_API_KEY`, `CRON_SECRET` |

All function URLs: `https://oriayiuaucsldkledjqt.supabase.co/functions/v1/<name>`

---

## 5. Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `chamas` | Groups/SACCOs | `name`, `plan`, `founded`, `monthly_contribution` |
| `profiles` | User membership per chama | `user_id`, `chama_id`, `role` (member/admin) |
| `contributions` | Member contributions | `member_id`, `amount`, `date`, `payment_method` |
| `loans` | Loans issued | `member_id`, `amount`, `status`, `balance` |
| `loan_repayments` | Repayment installments | `loan_id`, `amount`, `paid_at` |
| `meetings` | Meeting records | `chama_id`, `date`, `minutes` |
| `transactions` | Financial ledger | `chama_id`, `type`, `amount`, `description` |
| `notifications` | In-app notifications | `user_id`, `type`, `message`, `read` |
| `user_settings` | User preferences | `user_id`, `settings` (JSONB) |
| `push_subscriptions` | Browser push subs | `user_id`, `endpoint`, `keys` (JSONB) |
| `audit_logs` | All admin actions | `user_id`, `action`, `details`, `created_at` |
| `whatsapp_sessions` | WhatsApp sessions linked to chama members | `wa_id`, `member_id`, `chama_id`, `state`, `context` |
| `whatsapp_messages` | Inbound/outbound WhatsApp message log | `session_id`, `chama_id`, `direction`, `message_type`, `content`, `media_url` |
| `minutes_archive` | Voice note minutes from WhatsApp | `chama_id`, `created_by`, `title`, `summary`, `decisions`, `action_items` |

---

## 6. Monitoring Checklist

### What to watch
| Sign | Likely cause | Fix |
|------|-------------|-----|
| Supabase project paused | Free tier inactivity (7 days) | Unpause in dashboard |
| Edge functions return 401 | Expired/missing JWT in Authorization header | Re-login user; check `supabase.auth.getUser()` |
| Stripe checkout fails | Expired price ID or test mode mismatch | Verify price IDs in Stripe Dashboard |
| Emails not sending | Resend domain not verified | Check https://resend.com/domains |
| Webhook returns 401 | `STRIPE_WEBHOOK_SECRET` missing/wrong | Regenerate in Stripe Dashboard → Webhooks |
| Push notifications not working | VAPID keys or service worker issue | Check `VAPID_*` secrets + browser console |
| M-Pesa STK Push fails | (Future) Daraja credentials invalid | Re-enter Safaricom portal keys |
| Build failing | TypeScript errors, missing imports | Run `npm run typecheck` locally first |
| Tests failing | Component changes breaking mocks | Run `npm test` locally, update test mocks |

### Rate Limits
- **Signup:** 5 attempts per minute per IP (client-side)
- **AdminLogin:** 5 attempts per minute per IP (client-side)
- **send-email:** 10 requests per 60s per user (edge function)
- **Supabase auth:** Standard Supabase rate limits apply

### Cost Management
- **Vercel:** Free tier (100GB bandwidth, 6000 build mins/month) — sufficient for launch
- **Supabase:** Free tier (500 MB DB, 50k monthly active users, 2 GB bandwidth) — monitor usage
- **Resend:** Free tier (100 emails/day) — upgrade to Growth ($15/mo) for production
- **Stripe:** Pay-as-you-go (2.9% + KSh 30 per transaction in Kenya)

---

## 7. Common Commands

```bash
# Development
npm run dev                          # Start dev server
npm run build                        # Build for production
npm test                             # Run tests (44 tests, 11 files)
npm run typecheck                    # TypeScript check (0 errors)

# Supabase
supabase status                      # Check local connection
supabase functions list              # List deployed functions
supabase functions deploy <name> --no-verify-jwt
supabase functions serve <name>      # View logs
supabase db query --linked           # Run SQL on production DB

# Vercel
npx vercel --prod --yes              # Deploy frontend
npx vercel alias set <url> chama-os.vercel.app
npx vercel env ls                    # List env vars
npx vercel logs                      # View deployment logs

# Git
git add -A && git commit -m "msg"    # Commit changes
git push origin main                 # Push to GitHub
```

---

## 8. Stripe Webhook Configuration

**Endpoint URL:** `https://oriayiuaucsldkledjqt.supabase.co/functions/v1/stripe-webhook`

**Events listened for:**
- `checkout.session.completed` — upgrades chama plan → updates `chamas.plan`
- `invoice.payment_failed` — failed payment → creates notification
- `customer.subscription.deleted` — subscription cancelled → downgrades to free
- `customer.subscription.updated` — plan changed → syncs `chamas.plan`

**Troubleshooting:**
- If webhook returns 401 → `STRIPE_WEBHOOK_SECRET` is missing or expired
- To regenerate: Stripe Dashboard → Webhooks → ChamaOS Webhook → Reveal/Regenerate signing secret

---

## 9. Adding New Users

1. **Admin creates chama:** User signs up at `/signup` → `seed_chama` RPC auto-creates admin role
2. **Admin invites members:** Admin panel → User Management → "Invite Member" → sends email via `invite-member` edge function
3. **Member accepts:** Clicks link in email → confirms account → appears in Members list
4. **Member can:** View dashboard, make contributions, request loans, view meetings (their chama only)

---

## 10. Payment Flows

### Stripe (card — active in test mode)
1. Admin goes to Settings → Pricing → picks a plan
2. Frontend calls `stripe-checkout` edge function → creates Stripe Checkout session
3. User is redirected to Stripe's checkout page → enters card details
4. Stripe sends webhook event → `stripe-webhook` edge function updates `chamas.plan`
5. User redirected back to Settings → sees success message

### WhatsApp AI Features
1. **M-Pesa via SMS:** Members forward M-Pesa confirmation SMS to the AT WhatsApp number → AI parses it → auto-logs contribution
2. **Voice notes:** Members send voice notes → Google STT transcribes → Gemini structures into minutes → saved to `minutes_archive`
3. **AI Auditor:** Every Sunday 8 AM EAT → cron calls `ai-auditor` → Gemini generates chama summary → broadcast via WhatsApp
4. **Loan Risk:** Dashboard shows risk badge per loan → calls `/api/loan-risk` Vercel route → Gemini analyzes contribution history
5. **Onboarding:** New invited members get WhatsApp intro message (best-effort)

### M-Pesa (manual — current flow)
1. Member sends contribution to `0797 132 940` via M-Pesa
2. Admin records payment manually in the Contributions table
3. For automated STK Push (future): `mpesa-stkpush` edge function + `api/mpesa-callback.ts`

---

## 11. Troubleshooting Common Issues

### "Failed to run sql query" during migration
The full migration file has a `founded` column cast that fails if the column is already DATE type. Run only the `CREATE TABLE IF NOT EXISTS` sections for new tables instead.

### Vercel deploy succeeds but alias doesn't update
```
npx vercel alias set <url-from-deploy-output> chama-os.vercel.app
```

### Supabase project gets paused
The free Supabase project auto-pauses after 7 days of inactivity. Unpause in Supabase Dashboard → Project Settings → Restore.

### Edge function returns "Cannot retrieve service"
Project is paused/inactive. Unpause first, then redeploy.

### Tests fail with "Cannot find module"
Run `npm install` to ensure all dependencies are installed.

---

## 12. Upgrade Path

| Stage | Action | When |
|-------|--------|------|
| Launch | ✅ Done — site live on test mode | Now |
| Live payments | Activate Stripe account → swap to live keys | This week |
| Branded email | Verify Resend domain → update `from` address | ~72h (DNS) |
| Production infra | Set up custom SMTP, custom domain, Google OAuth | Next month |
| M-Pesa automation | Get Daraja credentials → configure `mpesa-stkpush` | Optional |
| Scale | Upgrade Vercel Pro ($20/mo), Supabase Pro ($25/mo) | When >50 users |

---

## Quick Reference

```
Supabase Project:   oriayiuaucsldkledjqt
Vercel Project:     chama-os (org: zing254s-projects)
GitHub Repo:        github.com/zing254/chama-os

```
