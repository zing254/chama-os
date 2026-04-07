import { Member, Contribution, Loan, Meeting } from './store';

export interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  role: Member['role'];
}

export interface ContributionFormData {
  memberId: string;
  amount: number;
  mpesaRef: string;
  type: Contribution['type'];
  status: Contribution['status'];
  date: string;
}

export interface LoanFormData {
  memberId: string;
  amount: number;
  interest: number;
  purpose: string;
  period: string;
}

export interface MeetingFormData {
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda: string;
}

export interface ChamaSettings {
  name: string;
  registrationNumber: string;
  location: string;
  founded: string;
  monthlyContribution: number;
  loanInterestRate: number;
  meetingSchedule: string;
  constitution: string;
}

export interface NotificationSettings {
  contributionReminders: boolean;
  loanReminders: boolean;
  mpesaAlerts: boolean;
  meetingNotifications: boolean;
  monthlyStatement: boolean;
  overdueEscalations: boolean;
  reminderDays: number;
}

export interface MpesaSettings {
  businessPaybill: string;
  accountNumber: string;
  shortcode: string;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  requirePinForLoans: boolean;
  readOnlyMembers: boolean;
}

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isSuccess: boolean;
}

export function createInitialFormState<T extends object>(initialData: T): FormState<T> {
  return {
    data: initialData,
    errors: {},
    isSubmitting: false,
    isSuccess: false,
  };
}

export function validateForm<T extends object>(
  data: T,
  rules: Partial<Record<keyof T, (value: unknown) => string | null>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const [field, validator] of Object.entries(rules)) {
    if (validator) {
      const value = data[field as keyof T];
      const error = validator(value);
      if (error) {
        errors[field as keyof T] = error;
      }
    }
  }
  
  return errors;
}