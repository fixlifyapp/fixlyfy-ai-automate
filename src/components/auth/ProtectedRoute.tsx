
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // If still loading, show a simple loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If no user after loading is complete, redirect to auth
  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }
  
  // User is authenticated, render children
  return <>{children}</>;
};
