
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useRBAC } from '@/components/auth/RBACProvider';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  requiredPermission 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, hasPermission, loading: rbacLoading } = useRBAC();
  const navigate = useNavigate();
  
  const loading = authLoading || rbacLoading;
  
  useEffect(() => {
    if (!loading) {
      // Check authentication first
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to access this page"
        });
        navigate('/auth');
        return;
      }
      
      // Check role if required
      if (requiredRole && !hasRole(requiredRole as any)) {
        toast.error("Access denied", {
          description: "You don't have permission to access this page"
        });
        navigate('/');
        return;
      }
      
      // Check permission if required
      if (requiredPermission && !hasPermission(requiredPermission)) {
        toast.error("Access denied", {
          description: "You don't have permission to access this page"
        });
        navigate('/');
        return;
      }
    }
  }, [user, loading, requiredRole, requiredPermission, hasRole, hasPermission, navigate]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
          <p className="text-fixlyfy-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Only render if authenticated and authorized
  const isAuthorized = user && 
    (!requiredRole || hasRole(requiredRole as any)) && 
    (!requiredPermission || hasPermission(requiredPermission));
  
  return isAuthorized ? <>{children}</> : null;
};
