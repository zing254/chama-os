import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';
import { supabase } from '../../data/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const now = Date.now();
    if (loginBlockedUntil > now) {
      const remaining = Math.ceil((loginBlockedUntil - now) / 1000);
      setError(`Too many attempts. Try again in ${remaining} seconds.`);
      return;
    }

    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) {
        const blockUntil = now + 30000;
        setLoginBlockedUntil(blockUntil);
        setError('Too many failed attempts. Blocked for 30 seconds.');
      } else {
        setError(authError);
      }
      setLoading(false);
      return;
    }

    const role = user?.role as string | undefined;
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'moderator';
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user?.id).single();
      if (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'moderator') {
        navigate('/admin/dashboard');
      } else {
        setError('You do not have admin access');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚙️</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">ChamaOS Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="admin@chamaos.co.ke"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Sign in with your Supabase auth credentials
        </p>
      </div>
    </div>
  );
}
