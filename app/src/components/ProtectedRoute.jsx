import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Wraps a route to require authentication and optionally a specific role.
 *
 * Usage:
 *   <ProtectedRoute><UserDashboard /></ProtectedRoute>
 *   <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
 *   <ProtectedRoute roles={['admin', 'developer']}><DevDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white opacity-60 font-mono text-sm">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    // Wrong role — redirect to their own dashboard
    const fallback = user.role === 'admin' ? '/admin' : user.role === 'developer' ? '/dev' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
