import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useData } from '../data/context';
import { useAuth } from '../data/auth-context';
import Dashboard from './Dashboard';
import Members from './Members';
import Contributions from './Contributions';
import Loans from './Loans';
import Meetings from './Meetings';
import Analytics from './Analytics';
import Pricing from './Pricing';
import Settings from './Settings';
import LanguageSwitcher from './LanguageSwitcher';

type Page = 'dashboard' | 'members' | 'contributions' | 'loans' | 'meetings' | 'analytics' | 'settings' | 'pricing';

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'members', label: 'Members', icon: '👥' },
  { id: 'contributions', label: 'Contributions', icon: '💰' },
  { id: 'loans', label: 'Loans', icon: '🏦' },
  { id: 'meetings', label: 'Meetings', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'pricing', label: 'Upgrade', icon: '⭐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  members: 'Members',
  contributions: 'Contributions',
  loans: 'Loans',
  meetings: 'Meetings',
  analytics: 'Analytics',
  pricing: 'Upgrade Plan',
  settings: 'Settings',
};

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case 'dashboard': return <Dashboard />;
    case 'members': return <Members />;
    case 'contributions': return <Contributions />;
    case 'loans': return <Loans />;
    case 'meetings': return <Meetings />;
    case 'analytics': return <Analytics />;
    case 'pricing': return <Pricing />;
    case 'settings': return <Settings />;
    default: return <Dashboard />;
  }
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { members, chama, loading } = useData();
  const { user, signOut } = useAuth();

  const currentPage = (location.pathname.slice(1).split('/')[0] || 'dashboard') as Page;
  const isValidPage = navItems.some(item => item.id === currentPage);

  useEffect(() => {
    if (!isValidPage) {
      navigate('/dashboard', { replace: true });
    }
  }, [isValidPage, navigate]);

  const handleNavigate = (page: Page) => {
    navigate(`/${page}`);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-black text-green-600">ChamaOS</h1>
            <p className="text-xs text-gray-500 mt-1">{chama?.name || 'Your Chama'}</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                  currentPage === item.id
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-100 space-y-1">
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <span>🔧</span>
              <span className="text-sm">Admin Panel</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50"
            >
              <span>🚪</span>
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm hidden sm:block">ChamaOS</span>
              <span className="text-gray-400 text-sm hidden sm:block">/</span>
              <span className="font-bold text-gray-900 text-sm">{pageTitles[currentPage]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="icon" />
            <button onClick={() => navigate('/loans')} aria-label="Notifications" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div aria-label="User menu" className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-black">
              {user?.email?.slice(0,2).toUpperCase() || members[0]?.avatar || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <PageContent page={currentPage} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}