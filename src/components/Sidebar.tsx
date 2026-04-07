import { chamaInfo } from '../data/store';

type Page = 'dashboard' | 'members' | 'contributions' | 'loans' | 'meetings' | 'analytics' | 'settings' | 'pricing';

const navItems: { id: Page; label: string; icon: string; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'members', label: 'Members', icon: '👥', badge: '24' },
  { id: 'contributions', label: 'Contributions', icon: '💰' },
  { id: 'loans', label: 'Loans', icon: '🏦', badge: '!' },
  { id: 'meetings', label: 'Meetings', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'pricing', label: 'Upgrade Plan', icon: '⭐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

type Props = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onGoHome: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ currentPage, onNavigate, onGoHome, sidebarOpen, setSidebarOpen }: Props) {
  const planColors: Record<string, string> = { free: 'bg-gray-500', starter: 'bg-green-500', pro: 'bg-blue-500', enterprise: 'bg-purple-500' };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-black text-sm">CO</span>
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-white">Chama<span className="text-green-400">OS</span></span>
              <div className="text-xs text-gray-400 leading-none">🇰🇪 Powered in Kenya</div>
            </div>
          </button>
        </div>

        {/* Chama info */}
        <div className="p-3 mx-3 mt-3 bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-xs font-black text-white shrink-0">UW</div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{chamaInfo.name}</div>
              <div className="text-xs text-gray-400">{chamaInfo.totalMembers} members</div>
            </div>
            <span className={`ml-auto text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full capitalize ${planColors[chamaInfo.plan]}`}>
              {chamaInfo.plan}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                currentPage === item.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  item.badge === '!' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-black text-white">GW</div>
            <div>
              <div className="text-xs font-bold text-white">Grace Wanjiku</div>
              <div className="text-xs text-green-400">Chairman</div>
            </div>
            <button className="ml-auto text-gray-500 hover:text-red-400 text-xs transition-colors" onClick={onGoHome}>
              Exit
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
