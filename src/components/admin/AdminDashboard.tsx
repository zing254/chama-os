import { useAdmin } from '../../data/admin-context';
import { useData } from '../../data/context';

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const { chama, members, contributions, loans, meetings } = useData();

  const activeLoans = loans.filter(l => l.status === 'active');
  const monthPaid = contributions
    .filter(c => c.status === 'paid')
    .reduce((s, c) => s + c.amount, 0);

  const stats = [
    { label: 'Total Fund', value: `KSh ${(monthPaid / 1000).toFixed(0)}K`, icon: '💰', color: 'from-purple-500 to-purple-700' },
    { label: 'Members', value: members.length.toString(), icon: '👥', color: 'from-green-500 to-green-700' },
    { label: 'Active Loans', value: activeLoans.length.toString(), icon: '💳', color: 'from-orange-500 to-orange-700' },
    { label: 'Chama', value: chama?.name?.split(' ')[0] || '1', icon: '🏛️', color: 'from-blue-500 to-blue-700' },
  ];

  const recentActivity = [
    ...contributions.slice(0, 3).map(c => ({
      action: 'Contribution recorded',
      user: c.memberName,
      time: c.date,
    })),
    ...loans.slice(0, 2).map(l => ({
      action: `Loan ${l.status}`,
      user: l.memberName,
      time: l.disbursedDate,
    })),
    ...meetings.slice(0, 1).map(m => ({
      action: `Meeting ${m.status}`,
      user: m.title,
      time: m.date,
    })),
  ].slice(0, 4);

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    moderator: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {admin?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColors[admin?.role || 'admin']}`}>
            {admin?.role?.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-gray-400 text-sm">Last login: today</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                <p className="text-xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">👤</span>
              <p className="text-sm font-semibold text-green-700 mt-1">Add Member</p>
            </button>
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">💳</span>
              <p className="text-sm font-semibold text-blue-700 mt-1">Approve Loan</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">📊</span>
              <p className="text-sm font-semibold text-purple-700 mt-1">View Reports</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">🔧</span>
              <p className="text-sm font-semibold text-orange-700 mt-1">System Tools</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {item.user[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.user} · {item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-bold text-green-700">Database</p>
              <p className="text-xs text-green-600">Connected to Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-bold text-green-700">API</p>
              <p className="text-xs text-green-600">All endpoints operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-bold text-green-700">Storage</p>
              <p className="text-xs text-green-600">Supabase managed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
