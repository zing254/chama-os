import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../data/auth-context', () => ({
  useAuth: () => ({ user: { id: 'test', email: 'test@test.com' }, loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../data/context', () => ({
  useData: () => ({
    chama: { name: 'Test Chama', monthlyContribution: 5000, totalFund: 100000, loanInterestRate: 10 },
    members: [
      { id: 'm1', name: 'Alice', totalContributed: 50000, status: 'active', shares: 10, avatar: 'AL', phone: '0712345678' },
      { id: 'm2', name: 'Bob', totalContributed: 30000, status: 'active', shares: 6, avatar: 'BO', phone: '0723456789' },
    ],
    contributions: [
      { id: 'c1', amount: 5000, date: '2024-11-01', month: 'November 2024', status: 'paid', memberName: 'Alice', memberId: 'm1' },
    ],
    meetings: [
      { id: 'meet1', title: 'Test Meeting', date: '2024-12-07', status: 'upcoming' },
    ],
    loans: [],
    addContribution: vi.fn(),
    loading: false,
  }),
  DataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../data/toast-context', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../data/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key, language: 'en', setLanguage: vi.fn(), toggleLanguage: vi.fn() }),
}));

import Dashboard from '../components/Dashboard';

describe('Dashboard', () => {
  it('renders chama name', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.getByText(/Test Chama/)).toBeDefined();
  });

  it('shows members count', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    const matches = screen.getAllByText(/2/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('shows upcoming meeting', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.getByText('Test Meeting')).toBeDefined();
  });
});
