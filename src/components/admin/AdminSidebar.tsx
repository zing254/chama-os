import { useState } from 'react';
import { cn } from '../../utils/cn';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onGoBack: () => void;
}

const adminNavItems = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'User Management', icon: '👥' },
  { id: 'chama-admin', label: 'Chama Settings', icon: '🏛️' },
  { id: 'tools', label: 'Tools & Logs', icon: '🔧' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'settings', label: 'System Settings', icon: '⚙️' },
];

export default function AdminSidebar({ currentPage, onNavigate, onGoBack }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-gray-900 text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <span className="font-bold text-lg">Admin Panel</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {adminNavItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              currentPage === item.id
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onGoBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🏠</span>
          {!collapsed && <span className="text-sm font-medium">Back to App</span>}
        </button>
      </div>
    </aside>
  );
}