export const DEFAULT_MONTHLY_CONTRIBUTION = 5000;
export const DEFAULT_INTEREST_RATE = 10;
export const LOAN_DURATION_DAYS = 180;
export const MPESA_NUMBER = '0797132940';
export const TOAST_DURATION_MS = 5000;
export const PLAN_PRICES = {
  free: 0,
  starter: 1999,
  pro: 4999,
  enterprise: 9999,
} as const;
export const DEFAULT_MEETING_TIME = '10:00';

export const PLAN_LIMITS: Record<string, { members: number; contributions: boolean; loans: boolean; analytics: boolean }> = {
  free: { members: 10, contributions: true, loans: false, analytics: false },
  starter: { members: 30, contributions: true, loans: true, analytics: true },
  pro: { members: 100, contributions: true, loans: true, analytics: true },
  enterprise: { members: 500, contributions: true, loans: true, analytics: true },
};
