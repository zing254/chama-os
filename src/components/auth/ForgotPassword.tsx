import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await forgotPassword(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

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
          {sent ? (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">✉️</div>
              <h2 className="text-xl font-bold text-white mb-2">Check Your Inbox</h2>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Link
                to="/login"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-gray-400 mt-6 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 ChamaOS Ltd. Reg. No. KE/2024/78432 · Zingri Master•Made with 💀 in Nairobi 🇰🇪
        </p>
      </div>
    </div>
  );
}
