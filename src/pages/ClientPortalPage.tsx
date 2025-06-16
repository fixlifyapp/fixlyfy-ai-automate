
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientPortalDashboard } from '@/components/portal/ClientPortalDashboard';
import { ClientPortalLogin } from '@/components/portal/ClientPortalLogin';
import { ClientPortalProvider } from '@/components/portal/ClientPortalProvider';
import { PageLayout } from '@/components/layout/PageLayout';

export default function ClientPortalPage() {
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Token will be validated in the provider
      setIsLoading(false);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ClientPortalProvider token={token}>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated ? (
          <ClientPortalDashboard />
        ) : (
          <ClientPortalLogin />
        )}
      </div>
    </ClientPortalProvider>
  );
}
