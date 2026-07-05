import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth-context';

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string | null;
}

interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, loading, signIn: authSignIn, signOut: authSignOut } = useAuth();

  const role = user?.role as string | undefined;
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'moderator';
  const admin: Admin | null = isAdmin && user ? {
    id: user.id,
    email: user.email,
    name: user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    role: 'admin',
    status: 'active',
    lastLogin: null,
  } : null;

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const result = await authSignIn(email, password);
    return result;
  };

  const signOut = async () => {
    await authSignOut();
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
