import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Contributions from './components/Contributions';
import Loans from './components/Loans';
import Meetings from './components/Meetings';
import Analytics from './components/Analytics';
import Pricing from './components/Pricing';
import Settings from './components/Settings';

type Page = 'dashboard' | 'members' | 'contributions' | 'loans' | 'meetings' | 'analytics' | 'settings' | 'pricing';

const pageComponents: Record<Page, React.ReactElement> = {
  dashboard: <Dashboard />,
  members: <Members />,
  contributions: <Contributions />,
  loans: <Loans />,
  meetings: <Meetings />,
  analytics: <Analytics />,
  pricing: <Pricing />,
  settings: <Settings />,
};

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

export default function App() {
  const [appState, setAppState] = useState<'landing' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') {
      setAppState('app');
      const page = location.pathname.slice(1) as Page;
      if (pageComponents[page]) {
        setCurrentPage(page);
      }
    }
  }, [location]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    navigate(`/${page}`);
  };

  const handleEnterApp = () => {
    setAppState('app');
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    setAppState('landing');
    navigate('/');
  };

  if (appState === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-inter">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onGoHome={handleGoHome}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm hidden sm:block">ChamaOS</span>
                <span className="text-gray-400 text-sm hidden sm:block">/</span>
                <span className="font-bold text-gray-900 text-sm">{pageTitles[currentPage]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              M-Pesa Live
            </div>

            <div className="relative">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>

            <button className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-black">
              GW
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {pageComponents[currentPage]}
          </div>
        </main>
      </div>
    </div>
  );
}
