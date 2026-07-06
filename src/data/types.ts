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
  status: 'active' | 'paid' | 'pending' | 'overdue';
  purpose: string;
  repayments: { id: string; amount: number; date: string; mpesaRef: string }[];
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  attendees: string[];
  agenda: string[];
  minutes: string;
};

export type Chama = {
  id: string;
  name: string;
  registrationNumber: string;
  trademark: string;
  founded: string;
  location: string;
  meetingSchedule: string;
  monthlyContribution: number;
  loanInterestRate: number;
  totalFund: number;
  totalMembers: number;
  totalLoansOut: number;
  plan: string;
  mpesaNumber?: string;
};

import { PLAN_PRICES } from '../data/constants';

export type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limits: { members: number };
  color: string;
  popular?: boolean;
  cta: string;
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: PLAN_PRICES.free,
    period: 'forever',
    features: [
      'Up to 10 members',
      'Basic contributions tracking',
      'Manual M-Pesa reconciliation',
      'Email support',
    ],
    limits: { members: 10 },
    color: 'gray',
    cta: 'Get Started',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: PLAN_PRICES.starter,
    period: 'month',
    features: [
      'Up to 30 members',
      'Auto M-Pesa reconciliation',
      'Loan management',
      'Meeting minutes',
      'Priority support',
    ],
    limits: { members: 30 },
    color: 'green',
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: PLAN_PRICES.pro,
    period: 'month',
    features: [
      'Up to 100 members',
      'Advanced analytics',
      'WhatsApp notifications',
      'Multiple chamas',
      'API access',
    ],
    limits: { members: 100 },
    color: 'blue',
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: PLAN_PRICES.enterprise,
    period: 'month',
    features: [
      'Unlimited members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise option',
    ],
    limits: { members: Infinity },
    color: 'purple',
    cta: 'Contact Sales',
  },
];
