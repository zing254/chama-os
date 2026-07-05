import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'recovery'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const type = searchParams.get('type');

    if (type === 'recovery') {
      setStatus('recovery');
      setMessage('Redirecting to password reset...');
      setTimeout(() => navigate('/reset-password'), 1000);
      return;
    }

    const checkVerification = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (user?.emailVerified) {
        setStatus('success');
        setMessage('Email verified successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else if (user) {
        setStatus('error');
        setMessage('Your email is not yet verified. Please check your inbox.');
      } else {
        setStatus('error');
        setMessage('Verification failed. Please try signing up again.');
      }
    };

    checkVerification();
  }, [user, navigate, searchParams]);

  if (status === 'recovery') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-white text-lg mb-4">{message}</p>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <Link
          to="/signup"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
        >
          Go to Sign Up
        </Link>
      </div>
    </div>
  );
}