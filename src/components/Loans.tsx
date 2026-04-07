import { useState } from 'react';
import { loans, members, Loan, addLoan } from '../data/store';

export default function Loans() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [newLoan, setNewLoan] = useState({
    memberId: '',
    amount: 50000,
    interest: 10,
    purpose: '',
    period: '6',
  });
  const [loanError, setLoanError] = useState('');
  const [loanSuccess, setLoanSuccess] = useState(false);

  const filtered = loans.filter(l => filterStatus === 'all' || l.status === filterStatus);
  const totalOut = loans.filter(l => l.status !== 'paid').reduce((s, l) => s + l.balance, 0);
  const totalInterest = loans.filter(l => l.status !== 'paid').reduce((s, l) => s + (l.amount * l.interest / 100), 0);
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  const repaidPercent = (loan: Loan) => {
    const repaid = loan.amount + (loan.amount * loan.interest / 100) - loan.balance;
    const total = loan.amount + (loan.amount * loan.interest / 100);
    return Math.min(100, Math.round((repaid / total) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Loan Management</h1>
          <p className="text-gray-500 text-sm">Track all chama loans and repayments</p>
        </div>
        <button onClick={() => setShowNewLoan(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
          + New Loan Application
        </button>
      </div>

      {/* Alerts */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="font-bold text-red-800">{overdueCount} Overdue Loan{overdueCount > 1 ? 's' : ''}</div>
            <div className="text-sm text-red-700 mt-0.5">
              {loans.filter(l => l.status === 'overdue').map(l => l.memberName).join(', ')} — immediate follow-up required.
            </div>
            <button className="text-red-600 font-bold text-xs mt-2 hover:underline">Send Reminder SMS →</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Loaned Out', value: `KSh ${totalOut.toLocaleString()}`, icon: '🏦', color: 'from-blue-500 to-blue-700' },
          { label: 'Expected Interest', value: `KSh ${Math.round(totalInterest).toLocaleString()}`, icon: '📈', color: 'from-green-500 to-emerald-600' },
          { label: 'Active Loans', value: loans.filter(l => l.status === 'active').length, icon: '📋', color: 'from-purple-500 to-purple-700' },
          { label: 'Overdue', value: overdueCount, icon: '⚠️', color: 'from-red-500 to-red-700' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-white/80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'overdue', 'paid', 'pending'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s} {s !== 'all' ? `(${loans.filter(l => l.status === s).length})` : `(${loans.length})`}
          </button>
        ))}
      </div>

      {/* Loans list */}
      <div className="space-y-4">
        {filtered.map(loan => (
          <div
            key={loan.id}
            onClick={() => setSelectedLoan(loan)}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-700 text-sm shrink-0">
                  {loan.memberName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{loan.memberName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">📋 {loan.purpose}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Disbursed {loan.disbursedDate} · Due {loan.dueDate}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 sm:text-right">
                <div>
                  <div className="text-xs text-gray-500">Loan Amount</div>
                  <div className="font-black text-gray-900">KSh {loan.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Balance</div>
                  <div className={`font-black ${loan.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    KSh {loan.balance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Interest ({loan.interest}%)</div>
                  <div className="font-bold text-green-700">KSh {(loan.amount * loan.interest / 100).toLocaleString()}</div>
                </div>
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[loan.status]}`}>
                    {loan.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Repayment progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Repayment Progress</span>
                <span className="font-bold">{repaidPercent(loan)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    loan.status === 'overdue' ? 'bg-red-400' :
                    loan.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${repaidPercent(loan)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">{loan.repayments.length} repayment{loan.repayments.length !== 1 ? 's' : ''} made</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loan Detail Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">Loan Details</h2>
              <button onClick={() => setSelectedLoan(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
                <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center font-black text-blue-800 text-sm">
                  {selectedLoan.memberName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-black text-gray-900">{selectedLoan.memberName}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[selectedLoan.status]}`}>{selectedLoan.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Principal', `KSh ${selectedLoan.amount.toLocaleString()}`],
                  ['Interest (10%)', `KSh ${(selectedLoan.amount * 0.10).toLocaleString()}`],
                  ['Total Payable', `KSh ${(selectedLoan.amount * 1.10).toLocaleString()}`],
                  ['Balance', `KSh ${selectedLoan.balance.toLocaleString()}`],
                  ['Disbursed', selectedLoan.disbursedDate],
                  ['Due Date', selectedLoan.dueDate],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm font-black text-gray-900 mt-0.5">{val}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Purpose</div>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-800">{selectedLoan.purpose}</div>
              </div>

              {selectedLoan.repayments.length > 0 && (
                <div>
                  <div className="font-bold text-gray-900 mb-2">Repayment History</div>
                  <div className="space-y-2">
                    {selectedLoan.repayments.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-green-50 rounded-lg p-2.5">
                        <div>
                          <div className="text-sm font-bold text-green-800">KSh {r.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 font-mono">{r.mpesaRef}</div>
                        </div>
                        <div className="text-xs text-gray-500">{r.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  + Record Repayment
                </button>
                <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  📱 Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Loan Modal */}
      {showNewLoan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">New Loan Application</h2>
              <button onClick={() => { setShowNewLoan(false); setLoanError(''); setLoanSuccess(false); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            {loanSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm font-semibold">
                ✅ Loan application submitted! It will be reviewed at the next meeting.
              </div>
            )}
            {loanError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 text-sm">
                {loanError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Applicant Member</label>
                <select 
                  value={newLoan.memberId}
                  onChange={(e) => setNewLoan({ ...newLoan, memberId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="">Select member...</option>
                  {members.filter(m => m.totalLoans === 0).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Loan Amount (KSh)</label>
                <input 
                  type="number" 
                  placeholder="50000"
                  value={newLoan.amount}
                  onChange={(e) => setNewLoan({ ...newLoan, amount: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Repayment Period</label>
                <select 
                  value={newLoan.period}
                  onChange={(e) => setNewLoan({ ...newLoan, period: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Purpose</label>
                <textarea 
                  rows={2} 
                  placeholder="Briefly describe the loan purpose..."
                  value={newLoan.purpose}
                  onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none" 
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
                <strong>Interest Rate: 10%</strong> — will be auto-calculated. Loan requires majority vote approval at next meeting.
              </div>
              <button 
                onClick={() => {
                  if (!newLoan.memberId) {
                    setLoanError('Please select a member');
                    return;
                  }
                  if (newLoan.amount <= 0) {
                    setLoanError('Please enter a valid loan amount');
                    return;
                  }
                  if (!newLoan.purpose.trim()) {
                    setLoanError('Please specify the loan purpose');
                    return;
                  }
                  const member = members.find(m => m.id === newLoan.memberId);
                  if (!member) return;
                  try {
                    addLoan({
                      ...newLoan,
                      memberName: member.name,
                    });
                    setLoanSuccess(true);
                    setTimeout(() => {
                      setShowNewLoan(false);
                      setLoanSuccess(false);
                      setNewLoan({
                        memberId: '',
                        amount: 50000,
                        interest: 10,
                        purpose: '',
                        period: '6',
                      });
                    }, 2000);
                  } catch (err) {
                    setLoanError('Failed to submit loan application');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-1 transition-colors"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
