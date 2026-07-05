import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-gray-400 mb-6">Your password has been updated successfully.</p>
          <p className="text-gray-500 text-sm">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            Chama<span className="text-green-400">OS</span>
          </h1>
          <p className="text-gray-400 mt-2">Kenya's #1 Chama Management Platform</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2">Set New Password</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
