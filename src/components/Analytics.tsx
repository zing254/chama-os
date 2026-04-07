import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { monthlyTrend, fundBreakdown, members, loans } from '../data/store';

const memberGrowth = [
  { month: 'Jan 23', members: 8 },
  { month: 'Apr 23', members: 10 },
  { month: 'Jul 23', members: 14 },
  { month: 'Oct 23', members: 18 },
  { month: 'Jan 24', members: 20 },
  { month: 'Apr 24', members: 22 },
  { month: 'Jul 24', members: 24 },
  { month: 'Nov 24', members: 24 },
];

const loanPerformance = [
  { month: 'Jun', issued: 120000, repaid: 35000 },
  { month: 'Jul', issued: 80000, repaid: 55000 },
  { month: 'Aug', issued: 50000, repaid: 70000 },
  { month: 'Sep', issued: 0, repaid: 68000 },
  { month: 'Oct', issued: 0, repaid: 25000 },
  { month: 'Nov', issued: 170000, repaid: 0 },
];

const contributionByMember = members.slice(0, 8).map(m => ({
  name: m.name.split(' ').slice(0, 2).join(' '),
  amount: m.totalContributed,
  shares: m.shares,
}));

export default function Analytics() {
  const totalFund = 1847500;
  const returnRate = ((75000 / totalFund) * 100).toFixed(1);
  const avgLoan = Math.round(loans.filter(l => l.status !== 'paid').reduce((s, l) => s + l.amount, 0) / loans.filter(l => l.status !== 'paid').length);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Fund Value', value: 'KSh 1.85M', change: '+3.4%', up: true, icon: '💰' },
          { label: 'Return Rate', value: `${returnRate}%`, change: '+0.5%', up: true, icon: '📈' },
          { label: 'Loan Recovery', value: '85%', change: '-5%', up: false, icon: '🔄' },
          { label: 'Avg Loan Size', value: `KSh ${(avgLoan/1000).toFixed(0)}K`, change: '+KSh 20K', up: true, icon: '🏦' },
        ].map(kpi => (
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

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fund growth */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Contributions vs Interest Earned</h3>
          <p className="text-xs text-gray-500 mb-4">Monthly breakdown — Jun to Nov 2024</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: unknown) => `KSh ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="contributions" name="Contributions" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interest" name="Interest" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fund allocation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Fund Allocation</h3>
          <p className="text-xs text-gray-500 mb-4">Where your money is working</p>
          <div className="flex items-center gap-4">
            <PieChart width={160} height={160}>
              <Pie data={fundBreakdown} cx={75} cy={75} outerRadius={70} dataKey="value" strokeWidth={2}>
                {fundBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-3">
              {fundBreakdown.map(item => {
                const pct = ((item.value / 1847500) * 100).toFixed(1);
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

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Member growth */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Member Growth</h3>
          <p className="text-xs text-gray-500 mb-4">Jan 2023 – Nov 2024</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 30]} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              <Line type="monotone" dataKey="members" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} name="Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loan performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-1">Loan Disbursements vs Repayments</h3>
          <p className="text-xs text-gray-500 mb-4">Jun – Nov 2024</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={loanPerformance} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: unknown) => `KSh ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="issued" name="Issued" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="repaid" name="Repaid" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top contributors leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Member Contribution Leaderboard 🏆</h3>
          <span className="text-xs text-gray-500">All-time totals</span>
        </div>
        <div className="space-y-3">
          {contributionByMember.map((m, i) => {
            const max = contributionByMember[0].amount;
            const pct = (m.amount / max) * 100;
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
                <div className="text-sm font-black text-gray-900 w-24 text-right shrink-0">KSh {m.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-400 w-16 text-right shrink-0">{m.shares} shares</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">🤖 AI Insights for Umoja Wetu</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '📈', insight: 'Your fund grew 3.4% this month — outperforming the average Kenyan bank savings rate of 2.1%.' },
            { icon: '⚠️', insight: 'Peter Maina\'s loan is overdue. Consider a repayment plan meeting before the December gathering.' },
            { icon: '💡', insight: 'Based on your fund size, you qualify for a 91-day T-Bill at 15.2% p.a. through CBK.' },
            { icon: '👥', insight: 'Member growth has stalled for 4 months. Consider a referral bonus to attract new members.' },
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
