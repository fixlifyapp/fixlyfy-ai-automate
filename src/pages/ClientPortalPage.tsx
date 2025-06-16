
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientPortalDashboard } from '@/components/portal/ClientPortalDashboard';
import { ClientPortalLogin } from '@/components/portal/ClientPortalLogin';
import { ClientPortalProvider } from '@/components/portal/ClientPortalProvider';

export default function ClientPortalPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    // Always show loading initially to validate token
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // If no token is provided, show the login page
  if (!token) {
    return <ClientPortalLogin />;
  }

  return (
    <ClientPortalProvider token={token}>
      <div className="min-h-screen bg-gray-50">
        <ClientPortalDashboard />
      </div>
    </ClientPortalProvider>
  );
}
