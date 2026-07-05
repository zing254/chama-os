import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../data/context';
import { useAuth } from '../data/auth-context';
import { useToast } from '../data/toast-context';
import { DEFAULT_INTEREST_RATE, DEFAULT_MONTHLY_CONTRIBUTION } from '../data/constants';
import { sendSMS, sendWhatsApp } from '../data/notifications-helper';
import AuditorPanel from './features/AuditorPanel';

function formatKsh(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { chama, members, contributions, loans, meetings, loading, addContribution } = useData();
  const toast = useToast();
  const [showRecord, setShowRecord] = useState(false);
  const [contribError, setContribError] = useState('');
  const [contribSuccess, setContribSuccess] = useState(false);
  const [newContribution, setNewContribution] = useState({
    memberId: '',
    amount: chama?.monthlyContribution || DEFAULT_MONTHLY_CONTRIBUTION,
    mpesaRef: '',
    type: 'monthly' as const,
    status: 'pending' as const,
    date: new Date().toISOString().split('T')[0],
  });
  
  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  const activeMembers = members.filter(m => m.status === 'active');
  const totalPaid = contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalOutstanding = loans.filter(l => l.status !== 'paid').reduce((s, l) => s + l.balance, 0);
  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const upcomingMeeting = meetings.find(m => m.status === 'upcoming');

  const monthlyContributions = contributions.reduce<Record<string, number>>((acc, c) => {
    if (c.status === 'paid') {
      acc[c.month] = (acc[c.month] || 0) + c.amount;
    }
    return acc;
  }, {});
  const monthlyTrend = Object.entries(monthlyContributions).slice(-6).map(([month, amount]) => ({
    month: month.split(' ')[0].slice(0, 3),
    contributions: amount,
    interest: Math.round(amount * (chama?.loanInterestRate ?? DEFAULT_INTEREST_RATE) / 100),
  }));

  const trendKeys = Object.keys(monthlyContributions).slice(-6);
  const rangeLabel = trendKeys.length > 0
    ? `${trendKeys[0].split(' ')[0].slice(0, 3)} – ${trendKeys[trendKeys.length - 1].split(' ')[0].slice(0, 3)} ${trendKeys[trendKeys.length - 1].split(' ')[1]}`
    : '';

  const totalFund = totalPaid;
  const loansOut = totalOutstanding;
  const fundBreakdown = [
    { name: 'Available Fund', value: Math.max(totalFund - loansOut, 0), color: '#16a34a' },
    { name: 'Loans Outstanding', value: loansOut, color: '#f59e0b' },
    { name: `Reserves (${chama?.loanInterestRate ?? DEFAULT_INTEREST_RATE}%)`, value: Math.round(totalFund * 0.05), color: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })()}, {user?.email?.split('@')[0] || 'Admin'} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">{chama?.name || 'Your Chama'} · Active Members: {activeMembers.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRecord(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
            + Record Payment
          </button>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            📤 Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Fund" value={formatKsh(totalFund)} sub={`${contributions.length} contributions`} icon="💰" color="from-green-500 to-emerald-600" textColor="text-green-50" />
        <StatCard label="Active Members" value={`${activeMembers.length}`} sub={`${members.length - activeMembers.length} inactive`} icon="👥" color="from-blue-500 to-blue-700" textColor="text-blue-50" />
        <StatCard label="Loans Outstanding" value={formatKsh(totalOutstanding)} sub={`${activeLoans.length} active loans`} icon="🏦" color="from-orange-500 to-orange-700" textColor="text-orange-50" />
        <StatCard label="Collections" value={formatKsh(totalPaid)} sub="All time" icon="📈" color="from-purple-500 to-purple-700" textColor="text-purple-50" />
      </div>

      {/* Alerts */}
      {overdueLoans.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-red-800">Overdue Loan Alert</div>
            <div className="text-sm text-red-700 mt-0.5">
              {overdueLoans.map(l => `${l.memberName} — KSh ${l.balance.toLocaleString()} overdue since ${l.dueDate}`).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Fund Growth Trend</h3>
              <p className="text-xs text-gray-500">{rangeLabel}</p>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-green-500 rounded inline-block"></span>Contributions</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-purple-400 rounded inline-block"></span>Interest</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colContrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: unknown) => formatKsh(Number(v))} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="contributions" stroke="#16a34a" strokeWidth={2} fill="url(#colContrib)" name="Contributions" />
              <Area type="monotone" dataKey="interest" stroke="#a855f7" strokeWidth={2} fill="url(#colInterest)" name="Interest Earned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Fund Allocation</h3>
          <p className="text-xs text-gray-500 mb-4">Total: {formatKsh(totalFund)}</p>
          <div className="flex justify-center">
            <PieChart width={160} height={160}>
              <Pie data={fundBreakdown} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={2}>
                {fundBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {fundBreakdown.filter(i => i.value > 0).map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 text-xs">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800 text-xs">{formatKsh(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent contributions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Contributions</h3>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">{contributions.filter(c => c.status === 'paid').length}/{contributions.length} paid</span>
          </div>
          <div className="space-y-2">
            {contributions.slice(0, 8).map(c => (
              <div key={c.id} className="flex items-center gap-3 py-1.5">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                  {c.memberName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{c.memberName.split(' ').slice(0, 2).join(' ')}</div>
                  {c.mpesaRef && <div className="text-xs text-gray-400">Ref: {c.mpesaRef}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">KSh {c.amount.toLocaleString()}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'paid' ? 'bg-green-100 text-green-700' :
                    c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: upcoming meeting + recent activity */}
        <div className="space-y-4">
          {/* Upcoming meeting */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
            <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">📅 Next Meeting</div>
            <div className="font-black text-lg">{upcomingMeeting?.title || 'No upcoming meeting'}</div>
            <div className="text-blue-200 text-sm mt-1">{upcomingMeeting?.date || ''}</div>
            <div className="text-blue-200 text-sm">{upcomingMeeting?.venue || ''}</div>
            <div className="mt-4 flex gap-2">
              <button className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                View Agenda
              </button>
              <button onClick={() => members.forEach(m => sendWhatsApp(m.phone, `📅 *Meeting Reminder*\n\n${upcomingMeeting?.title}\n${upcomingMeeting?.date} at ${upcomingMeeting?.time}\n📍 ${upcomingMeeting?.venue}`))} className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors">
                Send Reminder
              </button>
            </div>
          </div>

          {/* Top members */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">Top Contributors 🏆</h3>
            <div className="space-y-2">
              {members.slice(0, 4).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-400 w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{m.name.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-xs text-gray-400">{m.shares} shares</div>
                  </div>
                  <div className="text-sm font-bold text-gray-800">KSh {m.totalContributed.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-gradient-to-br from-gray-50 to-green-50 border border-green-100 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '💳', label: 'Record M-Pesa', cls: 'bg-green-600 text-white', onClick: () => setShowRecord(true) },
                { icon: '📝', label: 'New Loan', cls: 'bg-blue-600 text-white', onClick: () => {} },
                { icon: '📨', label: 'Send Reminder', cls: 'bg-orange-500 text-white', onClick: () => members.forEach(m => sendSMS(m.phone, `Dear ${m.name}, this is a reminder about your upcoming chama contribution. Please ensure timely payment.`)) },
                { icon: '📄', label: 'Generate Report', cls: 'bg-purple-600 text-white', onClick: () => {} },
              ].map(({ icon, label, cls, onClick }) => (
                <button key={label} onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 ${cls}`}>
                  <span>{icon}</span><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auditor Widget */}
      <AuditorPanel chamaId={chama?.id || ''} />

      {/* Record Payment Modal */}
      {showRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">Record Payment</h2>
              <button onClick={() => { setShowRecord(false); setContribError(''); setContribSuccess(false); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            {contribSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm font-semibold">
                ✅ Payment recorded successfully!
              </div>
            )}
            {contribError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 text-sm">
                {contribError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Member</label>
                <select
                  value={newContribution.memberId}
                  onChange={(e) => setNewContribution({ ...newContribution, memberId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="">Select member...</option>
                  {members.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Amount (KSh)</label>
                <input
                  type="number"
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({ ...newContribution, amount: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Contribution Type</label>
                <select
                  value={newContribution.type}
                  onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="monthly">Monthly Contribution</option>
                  <option value="shares">Shares</option>
                  <option value="fine">Fine</option>
                  <option value="special">Special Levy</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">M-Pesa Reference (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. QHJ4K7P2X1"
                  value={newContribution.mpesaRef}
                  onChange={(e) => setNewContribution({ ...newContribution, mpesaRef: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 font-mono"
                />
              </div>
              <button
                onClick={() => {
                  if (!newContribution.memberId) {
                    setContribError('Please select a member');
                    return;
                  }
                  if (newContribution.amount <= 0) {
                    setContribError('Please enter a valid amount');
                    return;
                  }
                  const member = members.find(m => m.id === newContribution.memberId);
                  if (!member) return;
                  try {
                    addContribution({
                      ...newContribution,
                      memberName: member.name,
                    });
                    toast.success('Payment recorded', `KSh ${newContribution.amount} contribution saved`);
                    setContribSuccess(true);
                    setTimeout(() => {
                      setShowRecord(false);
                      setContribSuccess(false);
                      setNewContribution({
                        memberId: '',
                        amount: chama?.monthlyContribution || DEFAULT_MONTHLY_CONTRIBUTION,
                        mpesaRef: '',
                        type: 'monthly',
                        status: 'pending',
                        date: new Date().toISOString().split('T')[0],
                      });
                    }, 1500);
                  } catch {
                    toast.error('Recording failed', 'Could not record payment');
                    setContribError('Failed to record payment');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-1 transition-colors"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color, textColor }: {
  label: string; value: string; sub: string; icon: string; color: string; textColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`text-sm font-medium ${textColor} opacity-80`}>{label}</div>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className={`text-xs mt-1 ${textColor} opacity-70`}>{sub}</div>
    </div>
  );
}
