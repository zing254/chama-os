import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useData } from '../data/context';

function formatKsh(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function Analytics() {
  const { members, contributions, loans, loading } = useData();

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  const totalPaid = contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const activeLoans = loans.filter(l => l.status !== 'paid');
  const avgLoan = activeLoans.length > 0
    ? Math.round(activeLoans.reduce((s, l) => s + l.amount, 0) / activeLoans.length)
    : 0;
  const totalOutstanding = activeLoans.reduce((s, l) => s + l.balance, 0);
  const returnRate = totalPaid > 0 ? ((totalOutstanding * 0.1 / totalPaid) * 100).toFixed(1) : '0';

  const monthlyTrend = contributions
    .filter(c => c.status === 'paid')
    .reduce<Record<string, { contributions: number; interest: number }>>((acc, c) => {
      const m = c.month.split(' ')[0].slice(0, 3);
      if (!acc[m]) acc[m] = { contributions: 0, interest: 0 };
      acc[m].contributions += c.amount;
      acc[m].interest += Math.round(c.amount * 0.05);
      return acc;
    }, {});
  const chartMonths = Object.entries(monthlyTrend).slice(-6).map(([month, d]) => ({
    month, ...d,
  }));

  const fundBreakdown = [
    { name: 'Available Fund', value: Math.max(totalPaid - totalOutstanding, 0), color: '#16a34a' },
    { name: 'Loans Outstanding', value: totalOutstanding, color: '#f59e0b' },
    { name: 'Reserves', value: Math.round(totalPaid * 0.05), color: '#64748b' },
  ];
  const totalAllocated = fundBreakdown.reduce((s, f) => s + f.value, 0) || 1;

  const contributionByMember = [...members]
    .sort((a, b) => b.totalContributed - a.totalContributed)
    .slice(0, 8)
    .map(m => ({
      name: m.name.split(' ').slice(0, 2).join(' '),
      amount: m.totalContributed,
      shares: m.shares,
    }));

  const monthlyLoanData = loans
    .filter(l => l.disbursedDate)
    .reduce<Record<string, { issued: number; repaid: number }>>((acc, l) => {
      const m = l.disbursedDate.slice(0, 7);
      if (!acc[m]) acc[m] = { issued: 0, repaid: 0 };
      acc[m].issued += l.amount;
      acc[m].repaid += l.repayments.reduce((s, r) => s + r.amount, 0);
      return acc;
    }, {});
  const loanChartData = Object.entries(monthlyLoanData).slice(-6).map(([month, d]) => ({
    month: month.slice(5),
    ...d,
  }));

  const kpiCards = [
    { label: 'Fund Value', value: formatKsh(totalPaid), change: 'Active', up: true, icon: '💰' },
    { label: 'Return Rate', value: `${returnRate}%`, change: 'Estimate', up: true, icon: '📈' },
    { label: 'Loan Recovery', value: `${loans.length > 0 ? Math.round((loans.filter(l => l.status === 'paid').length / loans.length) * 100) : 0}%`, change: `${activeLoans.length} active`, up: true, icon: '🔄' },
    { label: 'Avg Loan Size', value: `KSh ${(avgLoan / 1000).toFixed(0)}K`, change: `${loans.length} loans`, up: true, icon: '🏦' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm">Financial intelligence for your chama</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
            📥 Download Report
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">
            📤 Share Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xl">{kpi.icon}</div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Contributions vs Interest Earned</h3>
          <p className="text-xs text-gray-500 mb-4">Monthly breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartMonths.length > 0 ? chartMonths : [{ month: 'N/A', contributions: 0, interest: 0 }]} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: unknown) => `KSh ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="contributions" name="Contributions" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interest" name="Interest" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Fund Allocation</h3>
          <p className="text-xs text-gray-500 mb-4">Where your money is working</p>
          <div className="flex items-center gap-4">
            <PieChart width={160} height={160}>
              <Pie data={fundBreakdown.filter(f => f.value > 0)} cx={75} cy={75} outerRadius={70} dataKey="value" strokeWidth={2}>
                {fundBreakdown.filter(f => f.value > 0).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-3">
              {fundBreakdown.filter(f => f.value > 0).map(item => {
                const pct = ((item.value / totalAllocated) * 100).toFixed(1);
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-700 text-xs font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 text-xs">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Member Growth</h3>
          <p className="text-xs text-gray-500 mb-4">{members.length} total members</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(() => {
              const months: Record<string, number> = {};
              const totalMembers = members.length;

              contributions
                .filter(c => c.status === 'paid' && c.date)
                .forEach(c => {
                  const d = new Date(c.date!);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  months[key] = (months[key] || 0) + 1;
                });

              const sortedMonths = Object.keys(months).sort();
              if (sortedMonths.length === 0) {
                return [{ month: new Date().toLocaleString('default', { month: 'short' }), members: totalMembers }];
              }

              return sortedMonths.map((m, i) => ({
                month: new Date(m + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
                members: Math.round((totalMembers / sortedMonths.length) * (i + 1)),
              }));
            })()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, Math.max(members.length + 5, 10)]} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              <Line type="monotone" dataKey="members" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 6 }} name="Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Loan Disbursements vs Repayments</h3>
          <p className="text-xs text-gray-500 mb-4">{loans.length} total loans</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={loanChartData.length > 0 ? loanChartData : [{ month: 'N/A', issued: 0, repaid: 0 }]} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: unknown) => `KSh ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="issued" name="Issued" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="repaid" name="Repaid" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Member Contribution Leaderboard 🏆</h3>
          <span className="text-xs text-gray-500">All-time totals</span>
        </div>
        {contributionByMember.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No contribution data yet</p>
        ) : (
          <div className="space-y-3">
            {contributionByMember.map((m, i) => {
              const max = contributionByMember[0].amount;
              const pct = max > 0 ? (m.amount / max) * 100 : 0;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{i < 3 ? medals[i] : `${i + 1}`}</span>
                  <div className="w-28 text-sm font-semibold text-gray-800 truncate shrink-0">{m.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-black text-gray-900 w-24 text-right shrink-0">{formatKsh(m.amount)}</div>
                  <div className="text-xs text-gray-400 w-16 text-right shrink-0">{m.shares} shares</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">🤖 AI Insights</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '📈', insight: `Your fund totals ${formatKsh(totalPaid)} across ${members.length} members.` },
            { icon: '⚠️', insight: `${activeLoans.filter(l => l.status === 'overdue').length} loan(s) overdue. Consider repayment follow-up.` },
            { icon: '💡', insight: `Average contribution per member: ${formatKsh(members.length > 0 ? Math.round(totalPaid / members.length) : 0)}.` },
            { icon: '👥', insight: `${members.filter(m => m.status === 'active').length} active members. ${members.filter(m => m.status === 'inactive').length} inactive.` },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 flex gap-3">
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
