import { useData } from '../../data/context';
import { useAuth } from '../../data/auth-context';

export default function MemberDashboard() {
  const { user } = useAuth();
  const { members, contributions, loans, meetings } = useData();
  const memberId = user?.memberId;

  const myProfile = members.find(m => m.id === memberId);
  const myContributions = contributions.filter(c => c.memberId === memberId);
  const myLoans = loans.filter(l => l.memberId === memberId);
  const myTotalContributions = myContributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const activeLoans = myLoans.filter(l => l.status === 'active');
  const upcomingMeeting = meetings.find(m => m.status === 'upcoming');
  const myShares = myProfile?.shares || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Welcome back, {myProfile?.name?.split(' ')[0] || 'Member'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Your personal chama overview</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
            + Record Payment
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contributions"
          value={`KSh ${myTotalContributions.toLocaleString()}`}
          sub={`${myContributions.length} payments`}
          icon="💰"
          color="from-green-500 to-emerald-600"
          textColor="text-green-50"
        />
        <StatCard
          label="Active Loans"
          value={activeLoans.length.toString()}
          sub={`KSh ${activeLoans.reduce((s, l) => s + l.balance, 0).toLocaleString()} outstanding`}
          icon="🏦"
          color="from-orange-500 to-orange-700"
          textColor="text-orange-50"
        />
        <StatCard
          label="My Shares"
          value={myShares.toString()}
          sub={myProfile?.role ? `Role: ${myProfile.role}` : ''}
          icon="📊"
          color="from-blue-500 to-blue-700"
          textColor="text-blue-50"
        />
        <StatCard
          label="Upcoming Meetings"
          value={upcomingMeeting ? '1' : '0'}
          sub={upcomingMeeting?.title || 'No meetings scheduled'}
          icon="📅"
          color="from-purple-500 to-purple-700"
          textColor="text-purple-50"
        />
      </div>

      {activeLoans.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-orange-800">Active Loan Reminder</div>
            <div className="text-sm text-orange-700 mt-0.5">
              You have {activeLoans.length} active loan(s). Total outstanding: KSh {activeLoans.reduce((s, l) => s + l.balance, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">My Recent Contributions</h3>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
              {myContributions.filter(c => c.status === 'paid').length} paid
            </span>
          </div>
          {myContributions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No contributions yet</p>
          ) : (
            <div className="space-y-2">
              {myContributions.slice(0, 6).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{c.month}</div>
                    <div className="text-xs text-gray-400">{c.type} · Ref: {c.mpesaRef}</div>
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
          )}
        </div>

        <div className="space-y-4">
          {upcomingMeeting && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
              <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">📅 Next Meeting</div>
              <div className="font-black text-lg">{upcomingMeeting.title}</div>
              <div className="text-blue-200 text-sm mt-1">{upcomingMeeting.date} · {upcomingMeeting.time}</div>
              <div className="text-blue-200 text-sm">{upcomingMeeting.venue}</div>
              <div className="mt-4 flex gap-2">
                <button className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  View Agenda
                </button>
                <button className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors">
                  Confirm Attendance
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">My Loans</h3>
            {myLoans.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No loans taken yet</p>
            ) : (
              <div className="space-y-2">
                {myLoans.slice(0, 4).map(l => (
                  <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">KSh {l.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{l.purpose}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">KSh {l.balance.toLocaleString()}</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        l.status === 'active' ? 'bg-orange-100 text-orange-700' :
                        l.status === 'paid' ? 'bg-green-100 text-green-700' :
                        l.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{l.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-green-50 border border-green-100 rounded-2xl p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['💳', 'Make Payment', 'bg-green-600 text-white'],
                ['📝', 'Apply Loan', 'bg-blue-600 text-white'],
                ['📅', 'View Meetings', 'bg-purple-600 text-white'],
                ['📄', 'My Statement', 'bg-orange-500 text-white'],
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
