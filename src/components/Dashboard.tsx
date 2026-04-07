import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { members, contributions, loans, monthlyTrend, fundBreakdown } from '../data/store';

const statCards = [
  { label: 'Total Fund', value: 'KSh 1,847,500', sub: '+KSh 60,000 this month', icon: '💰', color: 'from-green-500 to-emerald-600', textColor: 'text-green-50' },
  { label: 'Active Members', value: '24 Members', sub: '22 active · 2 inactive', icon: '👥', color: 'from-blue-500 to-blue-700', textColor: 'text-blue-50' },
  { label: 'Loans Outstanding', value: 'KSh 420,000', sub: '4 active loans', icon: '🏦', color: 'from-orange-500 to-orange-700', textColor: 'text-orange-50' },
  { label: 'Interest Earned', value: 'KSh 75,000', sub: 'This financial year', icon: '📈', color: 'from-purple-500 to-purple-700', textColor: 'text-purple-50' },
];

function formatKsh(n: number) {
  return `KSh ${n.toLocaleString()}`;
}

export default function Dashboard() {
  const paidCount = contributions.filter(c => c.status === 'paid').length;
  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const upcomingMeeting = { title: 'December Monthly Meeting', date: 'Sat, Dec 7 · 10:00 AM', venue: 'David\'s Office, CBD' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Good morning, Grace 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Umoja Wetu Investment Group · November 2024</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
            + Record Payment
          </button>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            📤 Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`text-sm font-medium ${card.textColor} opacity-80`}>{card.label}</div>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-black">{card.value}</div>
            <div className={`text-xs mt-1 ${card.textColor} opacity-70`}>{card.sub}</div>
          </div>
        ))}
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
              <p className="text-xs text-gray-500">Jun – Nov 2024</p>
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
          <p className="text-xs text-gray-500 mb-4">Total: KSh 1,847,500</p>
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
            {fundBreakdown.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 text-xs">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800 text-xs">KSh {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* November contribution status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">November Contributions</h3>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">{paidCount}/{contributions.length} paid</span>
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
            <div className="font-black text-lg">{upcomingMeeting.title}</div>
            <div className="text-blue-200 text-sm mt-1">{upcomingMeeting.date}</div>
            <div className="text-blue-200 text-sm">{upcomingMeeting.venue}</div>
            <div className="mt-4 flex gap-2">
              <button className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                View Agenda
              </button>
              <button className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors">
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
                ['💳', 'Record M-Pesa', 'bg-green-600 text-white'],
                ['📝', 'New Loan', 'bg-blue-600 text-white'],
                ['📨', 'Send Reminder', 'bg-orange-500 text-white'],
                ['📄', 'Generate Report', 'bg-purple-600 text-white'],
              ].map(([icon, label, cls]) => (
                <button key={label as string} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 ${cls}`}>
                  <span>{icon}</span><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
