
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function PortalAccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, verifyToken } = useClientPortalAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const redirectTo = searchParams.get('redirect') || searchParams.get('jobId') || '/portal/dashboard';

  // If user is already logged in, redirect immediately
  useEffect(() => {
    if (user && !loading) {
      const destination = redirectTo.startsWith('/portal') ? redirectTo : `/portal/dashboard?jobId=${redirectTo}`;
      navigate(destination, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  // Process token when component mounts
  useEffect(() => {
    if (token && !user && !loading && !isProcessing) {
      handleTokenAccess();
    }
  }, [token, user, loading]);

  const handleTokenAccess = async () => {
    if (!token) {
      setError('No access token provided');
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await verifyToken(token);
      if (result.success) {
        // Success! User will be automatically redirected by the useEffect above
        console.log('Portal access successful');
      } else {
        setError(result.message || 'Invalid or expired access link');
      }
    } catch (error) {
      console.error('Portal access error:', error);
      setError('Failed to access portal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/portal/login');
  };

  if (loading || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-fixlyfy" />
          <p className="text-gray-600">
            {loading ? 'Loading...' : 'Accessing your portal...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Fixlyfy Client Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your estimates, invoices, and project information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Access Error
              </CardTitle>
              <CardDescription>
                We couldn't access your portal with this link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleRequestNewLink}
                  className="w-full bg-fixlyfy hover:bg-fixlyfy/90"
                >
                  Request New Access Link
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Having trouble? Contact support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Invalid Access Link</CardTitle>
              <CardDescription className="text-center">
                This link appears to be incomplete or invalid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRequestNewLink}
                className="w-full bg-fixlyfy hover:bg-fixlyfy/90"
              >
                Go to Portal Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
