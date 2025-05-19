
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading state while checking authentication
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="fixlyfy-gradient rounded-full p-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};
