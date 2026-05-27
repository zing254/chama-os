import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';
import { useData } from '../../data/context';
import MemberDashboard from './MemberDashboard';

type MemberPage = 'dashboard' | 'contributions' | 'loans' | 'meetings' | 'settings';

const navItems: { id: MemberPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'contributions', label: 'My Contributions', icon: '💰' },
  { id: 'loans', label: 'My Loans', icon: '🏦' },
  { id: 'meetings', label: 'Meetings', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  contributions: 'My Contributions',
  loans: 'My Loans',
  meetings: 'Meetings',
  settings: 'Settings',
};

function MemberContributions({ memberId }: { memberId?: string }) {
  const { contributions } = useData();
  const mine = contributions.filter(c => c.memberId === memberId);
  const paid = mine.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Contributions</h1>
          <p className="text-gray-500 text-sm">Total paid: {`KSh ${paid.toLocaleString()}`}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {mine.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">No contributions yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {mine.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-semibold text-gray-900">{c.month}</div>
                  <div className="text-xs text-gray-400">{c.type} · Ref: {c.mpesaRef || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{`KSh ${c.amount.toLocaleString()}`}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'paid' ? 'bg-green-100 text-green-700' :
                    c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberLoans({ memberId }: { memberId?: string }) {
  const { loans } = useData();
  const mine = loans.filter(l => l.memberId === memberId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Loans</h1>
          <p className="text-gray-500 text-sm">{mine.length} loan(s) taken</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {mine.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">No loans taken yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {mine.map(l => (
              <div key={l.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{`KSh ${l.amount.toLocaleString()}`}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    l.status === 'active' ? 'bg-orange-100 text-orange-700' :
                    l.status === 'paid' ? 'bg-green-100 text-green-700' :
                    l.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{l.status}</span>
                </div>
                <div className="text-xs text-gray-400">{l.purpose} · Balance: {`KSh ${l.balance.toLocaleString()}`}</div>
                {l.repayments.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">{l.repayments.length} repayment(s) made</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberMeetings() {
  const { meetings } = useData();
  const upcoming = meetings.filter(m => m.status === 'upcoming');
  const past = meetings.filter(m => m.status !== 'upcoming');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Meetings</h1>
          <p className="text-gray-500 text-sm">{meetings.length} total meetings</p>
        </div>
      </div>
      {upcoming.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider">Upcoming</h2>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
            <div className="font-black text-lg">{upcoming[0].title}</div>
            <div className="text-blue-200 text-sm mt-1">{upcoming[0].date} · {upcoming[0].time}</div>
            <div className="text-blue-200 text-sm">{upcoming[0].venue}</div>
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider mt-6">Past Meetings</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {past.map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-400">{m.date}</div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Your account settings</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-900 text-lg">Account</h2>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
          <input type="email" value={user?.email || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 bg-gray-50" />
        </div>
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-all"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MemberLayout() {
  const [page, setPage] = useState<MemberPage>('dashboard');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <MemberDashboard />;
      case 'contributions': return <MemberContributions memberId={user?.memberId} />;
      case 'loans': return <MemberLoans memberId={user?.memberId} />;
      case 'meetings': return <MemberMeetings />;
      case 'settings': return <MemberSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-black text-green-600">ChamaOS</h1>
          <p className="text-xs text-gray-500 mt-1">Member Portal</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                page === item.id
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50"
          >
            <span>🚪</span>
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">ChamaOS</span>
            <span className="text-gray-400 text-sm">/</span>
            <span className="font-bold text-gray-900 text-sm">{pageTitles[page]}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-black">
              {user?.email?.slice(0, 2).toUpperCase() || 'M'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
