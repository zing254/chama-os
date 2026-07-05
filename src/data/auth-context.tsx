import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  chamaId?: string;
  role?: 'admin' | 'member';
  memberId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithChamaName: (email: string, password: string, chamaName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function mapSupabaseUser(supabaseUser: User, profile?: { chama_id?: string; role?: 'admin' | 'member'; member_id?: string }): AppUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    emailVerified: supabaseUser.email_confirmed_at !== null,
    createdAt: supabaseUser.created_at,
    chamaId: profile?.chama_id,
    role: profile?.role,
    memberId: profile?.member_id,
  };
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('chama_id, role, member_id')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let recovered = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(mapSupabaseUser(session.user, profile || undefined));
      }
      recovered = true;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(mapSupabaseUser(session.user, profile || undefined));
      } else {
        setUser(null);
      }
      if (recovered) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUpWithChamaName = async (email: string, password: string, chamaName: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signUpError) return { error: signUpError.message };
    if (!data.user) return { error: 'Sign up failed' };

    // Call the seed function to create chama + profile + seed data
    const { error: seedError } = await supabase.rpc('seed_chama', { chama_name: chamaName });
    if (seedError) {
      return { error: 'Account created but chama setup failed. Please contact support.' };
    }

    const profile = await fetchProfile(data.user.id);
    setUser(mapSupabaseUser(data.user, profile || undefined));
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const resetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signUpWithChamaName,
        signInWithGoogle,
        forgotPassword,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
