import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate landing page based on role
    switch (user.role) {
      case 'worker':
        return <Navigate to="/worker" replace />;
      case 'organizer':
        return <Navigate to="/organizer" replace />;
      case 'sponsor':
        return <Navigate to="/sponsor" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}