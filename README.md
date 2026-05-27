# ChamaOS — Kenya's #1 Chama Management Platform

A modern SaaS platform for managing chamas (Kenyan rotating savings groups), SACCOs, and investment groups. Built with React 19, Vite 7, TypeScript, and Tailwind CSS v4. Backed by Supabase, Stripe, and Resend.

**Production:** https://chama-os.vercel.app

## Features

### Core Functionality
- **Dashboard** — Real-time overview of chama financial health with charts and KPIs
- **Member Management** — Add, view, and manage chama members with roles (Chairman, Treasurer, Secretary, Member)
- **Contributions Tracking** — Track monthly contributions, shares, fines
- **Loan Management** — Issue loans, track repayments, calculate interest automatically (10% default)
- **Meeting Management** — Schedule meetings, manage agendas, record minutes, track attendance
- **Analytics & Reports** — Visual dashboards for fund growth, loan performance, member contributions
- **Pricing Plans** — Upgrade flow with Stripe Checkout (Free / Starter KSh 1,999 / Pro KSh 4,999 / Enterprise KSh 9,999)
- **Admin Panel** — Super admin dashboard, user management, system tools, reports
- **Member Portal** — Members can view their contributions, loans, meetings
- **Settings** — Chama info, notifications, M-Pesa configuration, security
- **Internationalization** — Full English and Swahili support (163 translation keys each)
- **Push Notifications** — Web push notification support via Supabase and service workers

### Tech Stack
- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 7 (single-file output via `vite-plugin-singlefile`)
- **Styling:** Tailwind CSS v4
- **Backend/Database:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments:** Stripe (test mode, subscription-based)
- **Mobile Money:** Manual M-Pesa (STK Push code kept for future)
- **Email:** Resend API via Supabase Edge Functions
- **Charts:** Recharts
- **Routing:** React Router DOM v7
- **Utilities:** date-fns, lucide-react, clsx, tailwind-merge
- **Testing:** Vitest (jsdom), 19 tests across 5 files

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Environment variables are required — copy `.env.example` to `.env.local` and fill in real Supabase credentials. See `MANUAL_SETUP.md` for Stripe, M-Pesa, and domain setup steps.

## Project Structure

```
src/
├── main.tsx                        # Entry point
├── App.tsx                         # BrowserRouter, providers, all routes
├── index.css                       # Tailwind directives
├── vite-env.d.ts                   # Vite type declarations
├── components/
│   ├── auth/
│   │   ├── Login.tsx               # Sign-in page
│   │   ├── Signup.tsx              # Registration + seed_chama RPC
│   │   ├── AuthCallback.tsx        # Email verification handler
│   │   └── ProtectedRoute.tsx      # Auth gate wrapper
│   ├── admin/
│   │   ├── AdminLogin.tsx          # Admin sign-in (role check after auth)
│   │   ├── AdminLayout.tsx         # Admin panel layout + sub-pages
│   │   ├── AdminSidebar.tsx        # Admin navigation sidebar
│   │   ├── AdminDashboard.tsx      # System-wide stats
│   │   ├── AdminReports.tsx        # Analytics/reports
│   │   ├── AdminTools.tsx          # Tools, logs, DB backup, cache
│   │   └── UserManagement.tsx      # User CRUD for super admins
│   ├── member/
│   │   ├── MemberLayout.tsx        # Member portal layout + embedded pages
│   │   └── MemberDashboard.tsx     # Member's personal dashboard
│   ├── AppLayout.tsx               # Main app shell (sidebar + header + content)
│   ├── Dashboard.tsx               # Chama-level dashboard with charts
│   ├── Members.tsx                 # Member management table + CRUD
│   ├── Contributions.tsx           # Contributions tracker + reconcile
│   ├── Loans.tsx                   # Loan management
│   ├── Meetings.tsx                # Meeting scheduler
│   ├── Analytics.tsx               # Charts and reports
│   ├── Pricing.tsx                 # Plan comparison + Stripe checkout
│   ├── Settings.tsx                # Chama settings
│   ├── LandingPage.tsx             # Marketing landing page
│   ├── ErrorBoundary.tsx           # React error boundary
│   ├── Loading.tsx                 # Spinner component
│   ├── LanguageSwitcher.tsx        # EN/SW toggle
│   └── ToastContainer.tsx          # Toast notifications UI
├── data/
│   ├── supabase.ts                 # Supabase client (throws if creds missing)
│   ├── auth-context.tsx            # Auth context + Supabase real auth
│   ├── context.tsx                 # Data context (CRUD via Supabase, filtered by chamaId)
│   ├── admin-context.tsx           # Admin context (role-based access)
│   ├── i18n-context.tsx            # Internationalization context
│   ├── toast-context.tsx           # Toast notification context
│   ├── i18n.ts                     # 163 translation keys (EN + SW)
│   ├── constants.ts                # DEFAULT_MONTHLY_CONTRIBUTION, MPESA_NUMBER, PLAN_PRICES, etc.
│   ├── types.ts                    # TypeScript types + plan definitions
│   ├── email.ts                    # Email service (invokes send-email edge function)
│   ├── mpesa.ts                    # M-Pesa helper code (kept for future STK Push)
│   └── notifications.ts           # Push notification service
├── utils/
│   └── cn.ts                       # cn() utility (clsx + tailwind-merge)
└── test/
    ├── setup.ts                    # Vitest setup
    ├── auth-context.test.ts        # Auth context tests
    ├── cn.test.ts                  # cn utility tests
    ├── i18n.test.ts               # i18n completeness tests
    ├── Login.test.tsx              # Login page tests (wraps BrowserRouter)
    └── supabase.test.ts            # Supabase client tests
```

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | LandingPage | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/auth/callback` | AuthCallback | No (handles email verification) |
| `/dashboard` | AppLayout → Dashboard | Yes (regular user) |
| `/members` | AppLayout → Members | Yes (regular user) |
| `/contributions` | AppLayout → Contributions | Yes (regular user) |
| `/loans` | AppLayout → Loans | Yes (regular user) |
| `/meetings` | AppLayout → Meetings | Yes (regular user) |
| `/analytics` | AppLayout → Analytics | Yes (regular user) |
| `/settings` | AppLayout → Settings | Yes (regular user) |
| `/pricing` | AppLayout → Pricing | Yes (regular user) |
| `/member/*` | MemberLayout | Yes (member role) |
| `/admin/login` | AdminLogin | No |
| `/admin/*` | AdminLayout | Yes (admin role) |
| `*` | Redirect to `/` | — |

## Payment Flow

### M-Pesa
**Manual only** — members send contributions to `0797 132 940` (Safaricom Paybill), and the chama admin records the payment in the system. STK Push automation code exists in `src/data/mpesa.ts` and `supabase/functions/mpesa-stkpush/` but is kept for future use. Do not remove or modify either.

### Stripe (Active — Test Mode)
Subscription-based plan upgrades via Stripe Checkout:
- **Starter:** KSh 1,999/month
- **Pro:** KSh 4,999/month
- **Enterprise:** KSh 9,999/month

The Stripe publishable key is set in Vercel environment variables. The secret key is set in Supabase secrets for the `stripe-checkout` and `stripe-webhook` edge functions.

## Supabase

- **Project:** `oriayiuaucsldkledjqt`
- **Schema:** `supabase/migration-multi-tenant.sql` — multi-tenant with chama_id on every table
- **Auth:** Real Supabase Auth (not localStorage). Signup triggers `seed_chama` RPC
- **Edge Functions (5):** `invite-member`, `stripe-checkout`, `stripe-webhook`, `send-email`, `mpesa-stkpush`

See `AGENTS.md` for full Supabase and edge function documentation.

## Design System

- **Primary Color:** Green (#16a34a)
- **Font:** Inter (Tailwind default)
- **UI Style:** Modern card-based with rounded corners
- **Mobile:** Fully responsive with sidebar toggle

## Key Gotchas

- **Build time:** ~10-15s due to single-file inlining of all JS/CSS
- **No lint or typecheck scripts:** `tsconfig.json` has `noUnusedLocals: false` and `noUnusedParameters: false`
- **Path alias:** `@/` maps to `src/` (vite.config.ts + tsconfig.json)
- **Always use `cn()`:** Import from `@/utils/cn` (clsx + tailwind-merge), never raw class strings
- **MANUAL_SETUP.md** has detailed Stripe/M-Pesa/domain setup steps

## License

MIT
