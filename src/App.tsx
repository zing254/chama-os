import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './data/auth-context';
import { AdminProvider } from './data/admin-context';
import { DataProvider } from './data/context';
import { AuthProvider } from './data/auth-context';
import { I18nProvider } from './data/i18n-context';
import { ToastProvider } from './data/toast-context';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';

const LandingPage = React.lazy(() => import('./components/LandingPage'));
const AppLayout = React.lazy(() => import('./components/AppLayout'));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const MemberLayout = React.lazy(() => import('./components/member/MemberLayout'));
const Login = React.lazy(() => import('./components/auth/Login'));
const Signup = React.lazy(() => import('./components/auth/Signup'));
const ForgotPassword = React.lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const AuthCallback = React.lazy(() => import('./components/auth/AuthCallback'));

function RoutePage({ title, children }: { title: string; children: React.ReactNode }) {
  React.useEffect(() => {
    document.title = title
      ? `${title} — ChamaOS`
      : "ChamaOS — Kenya's #1 Chama Management Platform";
  }, [title]);
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedAdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <AdminLayout />;
}

function ProtectedMemberRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || user.role !== 'member') return <Navigate to="/login" replace />;
  return <MemberLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <I18nProvider>
          <ToastProvider>
            <AuthProvider>
              <AdminProvider>
                <DataProvider>
                  <React.Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/" element={<ErrorBoundary><RoutePage title=""><LandingPage /></RoutePage></ErrorBoundary>} />
                      <Route path="/login" element={<ErrorBoundary><RoutePage title="Sign In"><Login /></RoutePage></ErrorBoundary>} />
                      <Route path="/signup" element={<ErrorBoundary><RoutePage title="Sign Up"><Signup /></RoutePage></ErrorBoundary>} />
                      <Route path="/auth/callback" element={<ErrorBoundary><RoutePage title=""><AuthCallback /></RoutePage></ErrorBoundary>} />
                      <Route path="/forgot-password" element={<ErrorBoundary><RoutePage title="Forgot Password"><ForgotPassword /></RoutePage></ErrorBoundary>} />
                      <Route path="/reset-password" element={<ErrorBoundary><RoutePage title="Reset Password"><ResetPassword /></RoutePage></ErrorBoundary>} />
                      <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Dashboard"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/members" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Members"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/contributions" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Contributions"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/loans" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Loans"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/meetings" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Meetings"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/analytics" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Analytics"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/settings" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Settings"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/pricing" element={<ErrorBoundary><ProtectedRoute><RoutePage title="Pricing"><AppLayout /></RoutePage></ProtectedRoute></ErrorBoundary>} />
                      <Route path="/member/*" element={<ErrorBoundary><RoutePage title="Member Dashboard"><ProtectedMemberRoute /></RoutePage></ErrorBoundary>} />
                      <Route path="/admin/login" element={<ErrorBoundary><RoutePage title="Admin Login"><AdminLogin /></RoutePage></ErrorBoundary>} />
                      <Route path="/admin/*" element={<ErrorBoundary><RoutePage title="Admin Panel"><ProtectedAdminRoute /></RoutePage></ErrorBoundary>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </React.Suspense>
                  <ToastContainer />
                </DataProvider>
              </AdminProvider>
            </AuthProvider>
          </ToastProvider>
        </I18nProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
