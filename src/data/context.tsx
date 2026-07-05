import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import type { Member, Contribution, Loan, Meeting, Chama } from './types';
import { DEFAULT_MONTHLY_CONTRIBUTION, DEFAULT_INTEREST_RATE, LOAN_DURATION_DAYS } from '../data/constants';

interface DataContextType {
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  meetings: Meeting[];
  chama: Chama | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addMember: (data: { name: string; phone: string; email: string; role: Member['role'] }) => Promise<Member>;
  addContribution: (data: { memberId: string; amount: number; type: Contribution['type']; status: Contribution['status']; date: string; memberName: string; mpesaRef?: string }) => Promise<Contribution>;
  addLoan: (data: { memberId: string; amount: number; interest: number; purpose: string; memberName: string }) => Promise<Loan>;
  addMeeting: (data: { title: string; date: string; time: string; venue: string; agenda: string[] }) => Promise<Meeting>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  updateContribution: (id: string, data: Partial<Contribution>) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
  updateLoan: (id: string, data: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  addRepayment: (data: { loan_id: string; amount: number; date: string; mpesa_ref?: string }) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const chamaId = user?.chamaId;

  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [chama, setChama] = useState<Chama | null>(null);
  const [loading, setLoading] = useState(true);

  const addAuditLog = useCallback(async (action: string, details: string) => {
    if (!chamaId) return;
    await supabase.from('audit_logs').insert({
      chama_id: chamaId,
      user_id: user?.id,
      user_name: user?.email?.split('@')[0] || 'Unknown',
      action,
      details,
      level: 'info',
    }).maybeSingle();
  }, [chamaId, user?.id, user?.email]);

  const loadChama = useCallback(async (cid: string) => {
    const { data } = await supabase
      .from('chamas')
      .select('*')
      .eq('id', cid)
      .single();
    if (data) {
      setChama({
        id: data.id,
        name: data.name,
        registrationNumber: data.registration_number || '',
        trademark: data.trademark || '',
        founded: data.founded || '',
        location: data.location || '',
        meetingSchedule: data.meeting_schedule || '',
        monthlyContribution: data.monthly_contribution || DEFAULT_MONTHLY_CONTRIBUTION,
        loanInterestRate: data.loan_interest_rate || DEFAULT_INTEREST_RATE,
        totalFund: data.total_fund || 0,
        totalMembers: data.total_members || 0,
        totalLoansOut: data.total_loans_out || 0,
        plan: data.plan || 'free',
      });
    }
  }, []);

  const loadMembers = useCallback(async (cid: string) => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('chama_id', cid);
    if (data) {
      setMembers(data.map((d: { id: string; name: string; phone: string; email: string; role: string; join_date: string; avatar: string; status: string; shares: number; total_contributed: number; total_loans: number }) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        email: d.email || '',
        role: d.role as Member['role'],
        joinDate: d.join_date,
        avatar: d.avatar || d.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(),
        status: d.status as Member['status'],
        shares: d.shares || 0,
        totalContributed: d.total_contributed || 0,
        totalLoans: d.total_loans || 0,
      })));
    }
  }, []);

  const loadContributions = useCallback(async (cid: string) => {
    const { data } = await supabase
      .from('contributions')
      .select('*')
      .eq('chama_id', cid)
      .order('created_at', { ascending: false });
    if (data) {
      setContributions(data.map((d: { id: string; member_id: string; member_name: string; amount: number; date: string; month: string; type: string; status: string; mpesa_ref: string }) => ({
        id: d.id,
        memberId: d.member_id,
        memberName: d.member_name,
        amount: d.amount,
        date: d.date || '',
        month: d.month,
        type: d.type as Contribution['type'],
        status: d.status as Contribution['status'],
        mpesaRef: d.mpesa_ref || '',
      })));
    }
  }, []);

  const loadLoans = useCallback(async (cid: string) => {
    const { data } = await supabase
      .from('loans')
      .select('*')
      .eq('chama_id', cid)
      .order('created_at', { ascending: false });
    if (data) {
      const { data: repayments } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('chama_id', cid);

      const repayMap: Record<string, { id: string; amount: number; date: string; mpesaRef: string }[]> = {};
      (repayments || []).forEach((r: { id: string; loan_id: string; amount: number; date: string; mpesa_ref: string }) => {
        if (!repayMap[r.loan_id]) repayMap[r.loan_id] = [];
        repayMap[r.loan_id].push({
          id: r.id,
          amount: r.amount,
          date: r.date || '',
          mpesaRef: r.mpesa_ref || '',
        });
      });

      setLoans(data.map((d: { id: string; member_id: string; member_name: string; amount: number; interest: number; balance: number; disbursed_date: string; due_date: string; status: string; purpose: string }) => ({
        id: d.id,
        memberId: d.member_id,
        memberName: d.member_name,
        amount: d.amount,
        interest: d.interest,
        balance: d.balance,
        disbursedDate: d.disbursed_date,
        dueDate: d.due_date,
        status: d.status as Loan['status'],
        purpose: d.purpose || '',
        repayments: repayMap[d.id] || [],
      })));
    }
  }, []);

  const loadMeetings = useCallback(async (cid: string) => {
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('chama_id', cid)
      .order('date', { ascending: false });
    if (data) {
      setMeetings(data.map((d: { id: string; title: string; date: string; time: string; venue: string; status: string; attendees: string[]; agenda: string[]; minutes: string }) => ({
        id: d.id,
        title: d.title,
        date: d.date,
        time: d.time || '',
        venue: d.venue || '',
        status: d.status as Meeting['status'],
        attendees: d.attendees || [],
        agenda: d.agenda || [],
        minutes: d.minutes || '',
      })));
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!chamaId) return;
    setLoading(true);
    try {
      await Promise.all([
        loadChama(chamaId),
        loadMembers(chamaId),
        loadContributions(chamaId),
        loadLoans(chamaId),
        loadMeetings(chamaId),
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [chamaId, loadChama, loadMembers, loadContributions, loadLoans, loadMeetings]);

  useEffect(() => {
    if (chamaId) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [chamaId, refresh]);

  const addMemberFn = async (data: { name: string; phone: string; email: string; role: Member['role'] }) => {
    const now = new Date().toISOString().split('T')[0];
    const avatar = data.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const id = crypto.randomUUID();

    const { error } = await supabase.from('members').insert({
      id,
      chama_id: chamaId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: data.role,
      join_date: now,
      avatar,
      status: 'active',
      shares: 0,
      total_contributed: 0,
      total_loans: 0,
    });

    if (error) throw error;

    try { await addAuditLog('member.added', `Added member "${data.name}" as ${data.role}`); } catch {}

    const newMember: Member = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: data.role,
      joinDate: now,
      avatar,
      status: 'active',
      shares: 0,
      totalContributed: 0,
      totalLoans: 0,
    };
    setMembers(prev => [newMember, ...prev]);
    return newMember;
  };

  const updateMemberFn = async (id: string, data: Partial<Member>) => {
    if (!chamaId) return;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    const dbData: Record<string, unknown> = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.role !== undefined) dbData.role = data.role;
    if (data.status !== undefined) dbData.status = data.status;
    const { error } = await supabase.from('members').update(dbData).eq('id', id).eq('chama_id', chamaId);
    if (error) {
      refresh();
      throw error;
    }
    try { await addAuditLog('member.updated', `Updated member ${data.name || id}`); } catch {}
  };

  const deleteMemberFn = async (id: string) => {
    if (!chamaId) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    const { error } = await supabase.from('members').delete().eq('id', id).eq('chama_id', chamaId);
    if (error) {
      refresh();
      throw error;
    }
    try { await addAuditLog('member.deleted', `Deleted member ${id}`); } catch {}
  };

  const updateContributionFn = async (id: string, data: Partial<Contribution>) => {
    if (!chamaId) return;
    setContributions(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    const { error } = await supabase.from('contributions').update(data).eq('id', id).eq('chama_id', chamaId);
    if (error) {
      refresh();
      throw error;
    }
    try { await addAuditLog('contribution.updated', `Updated contribution ${id}`); } catch {}
  };

  const deleteContributionFn = async (id: string) => {
    if (!chamaId) return;
    setContributions(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from('contributions').delete().eq('id', id).eq('chama_id', chamaId);
    if (error) {
      refresh();
      throw error;
    }
    try { await addAuditLog('contribution.deleted', `Deleted contribution ${id}`); } catch {}
  };

  const updateLoanFn = async (id: string, data: Partial<Loan>) => {
    if (!chamaId) return;
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    const { error } = await supabase.from('loans').update(data).eq('id', id).eq('chama_id', chamaId);
    if (error) {
      refresh();
      throw error;
    }
    try { await addAuditLog('loan.updated', `Updated loan ${id}`); } catch {}
  };

  const addRepaymentFn = async (data: { loan_id: string; amount: number; date: string; mpesa_ref?: string }) => {
    if (!chamaId) return;
    const id = `r${Date.now()}`;
    const { error } = await supabase.from('loan_repayments').insert({
      id,
      chama_id: chamaId,
      loan_id: data.loan_id,
      amount: data.amount,
      date: data.date,
      mpesa_ref: data.mpesa_ref || '',
    });
    if (error) throw error;

    const loan = loans.find(l => l.id === data.loan_id);
    if (loan) {
      const newBalance = (loan.balance || loan.amount) - data.amount;
      await updateLoanFn(data.loan_id, {
        balance: Math.max(0, newBalance),
        status: newBalance <= 0 ? 'paid' : loan.status,
      });
    }

    try { await addAuditLog('repayment.added', `Recorded repayment of KSh ${data.amount} for loan ${data.loan_id}`); } catch {}

    await refresh();
  };

  const deleteLoanFn = async (id: string) => {
    if (!chamaId) return;
    setLoans(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('loans').delete().eq('id', id).eq('chama_id', chamaId);
    if (error) {
      refresh();
      throw error;
    }
    try { await addAuditLog('loan.deleted', `Deleted loan ${id}`); } catch {}
  };

  const addContributionFn = async (input: { memberId: string; amount: number; type: Contribution['type']; status: Contribution['status']; date: string; memberName: string; mpesaRef?: string }) => {
    const month = new Date().toLocaleString('en-KE', { month: 'long', year: 'numeric' });
    const id = crypto.randomUUID();
    const mpesaRef = input.mpesaRef || '';

    const { error } = await supabase.from('contributions').insert({
      id,
      chama_id: chamaId,
      member_id: input.memberId,
      member_name: input.memberName,
      amount: input.amount,
      date: input.date,
      month,
      type: input.type,
      status: input.status,
      mpesa_ref: mpesaRef,
    });

    if (error) throw error;

    try { await addAuditLog('contribution.added', `Recorded KSh ${input.amount} contribution by "${input.memberName}" (${input.type})`); } catch {}

    const newContribution: Contribution = {
      id,
      memberId: input.memberId,
      memberName: input.memberName,
      amount: input.amount,
      date: input.date,
      month,
      type: input.type,
      status: input.status,
      mpesaRef,
    };
    setContributions(prev => [newContribution, ...prev]);
    return newContribution;
  };

  const addLoanFn = async (input: { memberId: string; amount: number; interest: number; purpose: string; memberName: string }) => {
    const disbursedDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + LOAN_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const id = crypto.randomUUID();
    const balance = input.amount + (input.amount * input.interest / 100);

    const { error } = await supabase.from('loans').insert({
      id,
      chama_id: chamaId,
      member_id: input.memberId,
      member_name: input.memberName,
      amount: input.amount,
      interest: input.interest,
      balance,
      disbursed_date: disbursedDate,
      due_date: dueDate,
      status: 'pending',
      purpose: input.purpose,
    });

    if (error) throw error;

    try { await addAuditLog('loan.added', `Approved KSh ${input.amount} loan for "${input.memberName}" at ${input.interest}% interest`); } catch {}

    const newLoan: Loan = {
      id,
      memberId: input.memberId,
      memberName: input.memberName,
      amount: input.amount,
      interest: input.interest,
      balance,
      disbursedDate,
      dueDate,
      status: 'pending',
      purpose: input.purpose,
      repayments: [],
    };
    setLoans(prev => [newLoan, ...prev]);
    return newLoan;
  };

  const addMeetingFn = async (input: { title: string; date: string; time: string; venue: string; agenda: string[] }) => {
    const id = crypto.randomUUID();

    const { error } = await supabase.from('meetings').insert({
      id,
      chama_id: chamaId,
      title: input.title,
      date: input.date,
      time: input.time,
      venue: input.venue,
      status: 'upcoming',
      agenda: input.agenda,
      minutes: '',
      attendees: [],
    });

    if (error) throw error;

    try { await addAuditLog('meeting.added', `Scheduled meeting "${input.title}" on ${input.date} at ${input.venue}`); } catch {}

    const newMeeting: Meeting = {
      id,
      title: input.title,
      date: input.date,
      time: input.time,
      venue: input.venue,
      status: 'upcoming',
      attendees: [],
      agenda: input.agenda,
      minutes: '',
    };
    setMeetings(prev => [newMeeting, ...prev]);
    return newMeeting;
  };

  return (
    <DataContext.Provider
      value={{
        members,
        contributions,
        loans,
        meetings,
        chama,
        loading,
        refresh,
        addMember: addMemberFn,
        addContribution: addContributionFn,
        addLoan: addLoanFn,
        addMeeting: addMeetingFn,
        updateMember: updateMemberFn,
        deleteMember: deleteMemberFn,
        updateContribution: updateContributionFn,
        deleteContribution: deleteContributionFn,
        updateLoan: updateLoanFn,
        deleteLoan: deleteLoanFn,
        addRepayment: addRepaymentFn,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
