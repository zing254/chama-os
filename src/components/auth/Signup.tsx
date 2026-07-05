import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [chamaName, setChamaName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupAttempts, setSignupAttempts] = useState(0);
  const [signupBlockedUntil, setSignupBlockedUntil] = useState(0);

  const { signUpWithChamaName } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!chamaName.trim()) {
      setError('Please enter your chama name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const now = Date.now();
    if (signupBlockedUntil > now) {
      const remaining = Math.ceil((signupBlockedUntil - now) / 1000);
      setError(`Too many attempts. Try again in ${remaining} seconds.`);
      return;
    }

    setLoading(true);

    const result = await signUpWithChamaName(email, password, chamaName);

    if (result.error) {
      const newAttempts = signupAttempts + 1;
      setSignupAttempts(newAttempts);
      if (newAttempts >= 3) {
        const blockUntil = now + 30000;
        setSignupBlockedUntil(blockUntil);
        setError(`Too many failed attempts. Blocked for 30 seconds.`);
      } else {
        setError(result.error);
      }
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-white mb-4">Check your email!</h2>
            <p className="text-gray-400 mb-6">
              We've sent a verification link to <span className="text-white font-semibold">{email}</span>.
              Click the link to activate your account.
            </p>
            <p className="text-gray-500 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <Link to="/signup" className="text-green-400 hover:text-green-300">
                try again
              </Link>
            </p>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            © 2026 ChamaOS Ltd. Reg. No. KE/2024/78432
          </p>
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
          <p className="text-gray-400 mt-2">Create your chama account</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="chamaName" className="block text-sm font-medium text-gray-300 mb-1">Chama Name</label>
              <input
                id="chamaName"
                type="text"
                value={chamaName}
                onChange={(e) => setChamaName(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="e.g. Umoja Wetu Investment Group"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating your chama...' : 'Create Chama Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 ChamaOS Ltd. Reg. No. KE/2024/78432
        </p>
      </div>
    </div>
  );
}
