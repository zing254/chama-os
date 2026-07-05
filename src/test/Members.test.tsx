import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../data/auth-context', () => ({
  useAuth: () => ({ user: { id: 'test' }, loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../data/context', () => ({
  useData: () => ({
    members: [
      { id: 'm1', name: 'Alice', phone: '0712345678', email: 'alice@test.com', role: 'member', status: 'active', totalContributed: 50000, totalLoans: 0, shares: 10, avatar: 'AL', joinDate: '2024-01-01' },
      { id: 'm2', name: 'Bob', phone: '0723456789', email: 'bob@test.com', role: 'treasurer', status: 'active', totalContributed: 30000, totalLoans: 50000, shares: 6, avatar: 'BO', joinDate: '2024-02-01' },
    ],
    chama: { plan: 'starter', name: 'Test Chama' },
    addMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
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

import Members from '../components/Members';

describe('Members', () => {
  it('renders member list', () => {
    render(<BrowserRouter><Members /></BrowserRouter>);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('shows member search input', () => {
    render(<BrowserRouter><Members /></BrowserRouter>);
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
  });

  it('shows add member button', () => {
    render(<BrowserRouter><Members /></BrowserRouter>);
    const addBtn = screen.getAllByText(/add member/i);
    expect(addBtn.length).toBeGreaterThan(0);
  });
});
