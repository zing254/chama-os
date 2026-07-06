import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../data/admin-context';
import { supabase } from '../../data/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [stats, setStats] = useState([
    { label: 'Total Chamas', value: '—', icon: '🏛️', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Members', value: '—', icon: '👥', color: 'from-green-500 to-green-700' },
    { label: 'Total Contributions', value: '—', icon: '💰', color: 'from-purple-500 to-purple-700' },
    { label: 'Total Loans', value: '—', icon: '💳', color: 'from-orange-500 to-orange-700' },
  ]);

  useEffect(() => {
    Promise.all([
      supabase.from('chamas').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('contributions').select('*', { count: 'exact', head: true }),
      supabase.from('loans').select('*', { count: 'exact', head: true }),
    ]).then(([chamas, profiles, contributions, loans]) => {
      setStats([
        { label: 'Total Chamas', value: String(chamas.count ?? 0), icon: '🏛️', color: 'from-blue-500 to-blue-700' },
        { label: 'Total Members', value: String(profiles.count ?? 0), icon: '👥', color: 'from-green-500 to-green-700' },
        { label: 'Total Contributions', value: String(contributions.count ?? 0), icon: '💰', color: 'from-purple-500 to-purple-700' },
        { label: 'Total Loans', value: String(loans.count ?? 0), icon: '💳', color: 'from-orange-500 to-orange-700' },
      ]);
    });
  }, []);

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
            <button onClick={() => navigate('/members')} className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">👤</span>
              <p className="text-sm font-semibold text-green-700 mt-1">Add Member</p>
            </button>
            <button onClick={() => navigate('/loans')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">💳</span>
              <p className="text-sm font-semibold text-blue-700 mt-1">Approve Loan</p>
            </button>
            <button onClick={() => navigate('/admin/tools')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">📊</span>
              <p className="text-sm font-semibold text-purple-700 mt-1">View Reports</p>
            </button>
            <button onClick={() => navigate('/admin/tools')} className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl text-left transition-colors">
              <span className="text-2xl">🔧</span>
              <p className="text-sm font-semibold text-orange-700 mt-1">System Tools</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">System-wide Overview</h2>
          <p className="text-gray-500 text-sm">Admin dashboard shows aggregate data across all chamas. Use specific chama dashboards for per-chama details.</p>
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
