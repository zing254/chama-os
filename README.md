# ChamaOS - Kenya's #1 Chama Management Platform

A modern SaaS platform for managing chamas ( Kenyan rotating savings groups), SACCOs, and investment groups. Built with React, Vite, and Tailwind CSS.

## Features

### Core Functionality
- **Dashboard** - Real-time overview of chama financial health with charts and KPIs
- **Member Management** - Add, view, and manage chama members with roles (Chairman, Treasurer, Secretary, Member)
- **Contributions Tracking** - Track monthly contributions, shares, fines with M-Pesa integration
- **Loan Management** - Issue loans, track repayments, calculate interest automatically
- **Meeting Management** - Schedule meetings, manage agendas, record minutes, track attendance
- **Analytics & Reports** - Visual dashboards for fund growth, loan performance, member contributions
- **Pricing Plans** - Upgrade flow with M-Pesa payment integration
- **Settings** - Chama info, notifications, M-Pesa configuration, security settings

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Utilities**: date-fns, lucide-react, clsx, tailwind-merge

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

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

## Project Structure

```
src/
├── components/
│   ├── LandingPage.tsx     # Marketing landing page
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Dashboard.tsx       # Main dashboard with charts
│   ├── Members.tsx         # Member management
│   ├── Contributions.tsx  # Contribution tracking
│   ├── Loans.tsx           # Loan management
│   ├── Meetings.tsx        # Meeting scheduler
│   ├── Analytics.tsx       # Reports and analytics
│   ├── Pricing.tsx         # Plan upgrade page
│   └── Settings.tsx       # App settings
├── data/
│   └── store.ts           # Data types and seed data
├── utils/
│   └── cn.ts              # ClassName utility
├── App.tsx                # Main app with routing
└── main.tsx               # Entry point
```

## Routes

- `/` - Landing Page
- `/dashboard` - Dashboard
- `/members` - Member Management
- `/contributions` - Contributions
- `/loans` - Loan Management
- `/meetings` - Meeting Management
- `/analytics` - Analytics & Reports
- `/pricing` - Upgrade Plan
- `/settings` - Settings

## Key Features in Detail

### M-Pesa Integration
The platform simulates M-Pesa payment flows:
- STK Push simulation for payments
- Paybill connection (247247)
- Automatic transaction matching
- Payment confirmation workflows

### Loan Management
- 10% interest rate auto-calculation
- Repayment tracking with progress bars
- Overdue loan alerts
- Repayment history

### Meeting Workflow
- Schedule upcoming meetings
- Manage agenda items
- Track attendance
- Generate and share minutes

## Design System

- **Primary Color**: Green (#16a34a)
- **Font**: Inter
- **UI Style**: Modern card-based with rounded corners
- **Mobile**: Fully responsive with sidebar toggle

## License

MIT