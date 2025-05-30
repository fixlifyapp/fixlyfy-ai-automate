
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { logSecurityEvent } from '@/utils/security';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // DEVELOPER MODE: Bypass auth temporarily
  const isDeveloperMode = true; // Set this to false to re-enable auth
  
  useEffect(() => {
    if (!isDeveloperMode && !loading && !user) {
      logSecurityEvent('unauthorized_access_attempt', { 
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      
      toast.error("Authentication required", {
        description: "Please sign in to access this page",
        duration: 5000,
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, isDeveloperMode]);
  
  // In developer mode, always show children
  if (isDeveloperMode) {
    return <>{children}</>;
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fixlify-bg">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-fixlify" />
            <Loader2 size={40} className="animate-spin text-fixlify" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-fixlify">Verifying Access</p>
            <p className="text-fixlify-text-secondary">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : null;
};
