import { useState } from 'react';
import { useAdmin } from '../../data/admin-context';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import AdminTools from './AdminTools';
import AdminReports from './AdminReports';
import AdminChamaSettings from './AdminChamaSettings';
import AdminSystemSettings from './AdminSystemSettings';

const adminPages: Record<string, React.ReactNode> = {
  'admin-dashboard': <AdminDashboard />,
  'users': <UserManagement />,
  'tools': <AdminTools />,
  'analytics': <AdminReports />,
  'chama-admin': <AdminChamaSettings />,
  'settings': <AdminSystemSettings />,
};

export default function AdminLayout() {
  const { signOut } = useAdmin();
  const [currentPage, setCurrentPage] = useState('admin-dashboard');

  const handleGoBack = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onGoBack={handleGoBack}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Admin /</span>
            <span className="font-bold text-gray-900 text-sm">
              {currentPage.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {adminPages[currentPage]}
          </div>
        </main>
      </div>
    </div>
  );
}