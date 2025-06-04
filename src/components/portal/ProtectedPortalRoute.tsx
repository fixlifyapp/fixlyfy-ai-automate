
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface ProtectedPortalRouteProps {
  children: React.ReactNode;
}

export function ProtectedPortalRoute({ children }: ProtectedPortalRouteProps) {
  const { user, loading } = useClientPortalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/portal/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSkeleton type="page" />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
