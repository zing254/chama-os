import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../data/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Not Verified</h2>
          <p className="text-gray-400 mb-6">
            Please verify your email address to access ChamaOS. 
            Check your inbox for the verification link.
          </p>
          <a
            href="/login"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (user.role === 'member') {
    return <Navigate to="/member" replace />;
  }

  return <>{children}</>;
}
