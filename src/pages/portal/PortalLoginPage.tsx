
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle, ExternalLink } from 'lucide-react';

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, authenticateWithToken } = useClientPortalAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const jobId = searchParams.get('jobId');

  // If user is already logged in, redirect to appropriate page
  useEffect(() => {
    if (user && !loading && !isAuthenticating) {
      if (jobId) {
        navigate(`/portal/estimates?jobId=${jobId}`, { replace: true });
      } else {
        navigate('/portal/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate, jobId, isAuthenticating]);

  // Handle token-based authentication
  useEffect(() => {
    if (token && !user && !loading && !isAuthenticating) {
      handleTokenAuthentication();
    }
  }, [token, user, loading, isAuthenticating]);

  const handleTokenAuthentication = async () => {
    if (!token) return;
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      const result = await authenticateWithToken(token);
      if (result.success) {
        toast.success('Access granted! Welcome to your portal.');
        
        // Navigate based on resource type or jobId
        if (result.resourceType === 'estimate' && result.resourceId) {
          navigate(`/portal/estimates/${result.resourceId}`, { replace: true });
        } else if (result.resourceType === 'invoice' && result.resourceId) {
          navigate(`/portal/invoices/${result.resourceId}`, { replace: true });
        } else if (jobId) {
          navigate(`/portal/estimates?jobId=${jobId}`, { replace: true });
        } else {
          navigate('/portal/dashboard', { replace: true });
        }
      } else {
        setAuthError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      const errorMessage = 'Failed to authenticate access link';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {isAuthenticating ? 'Authenticating...' : 'Loading...'}
            </h2>
            <p className="text-gray-600">
              {isAuthenticating ? 'Verifying your access link' : 'Please wait'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fixlify</h1>
                <p className="text-sm text-blue-600">Client Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              {authError ? (
                <ExternalLink className="h-8 w-8 text-white" />
              ) : (
                <CheckCircle className="h-8 w-8 text-white" />
              )}
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Your Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your estimates, invoices, and project information
            </p>
          </div>

          <Card className="shadow-xl border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Lock className="h-5 w-5" />
                Secure Access
              </CardTitle>
              <CardDescription>
                {token 
                  ? authError 
                    ? 'There was an issue with your access link'
                    : 'Processing your secure access link...'
                  : 'Invalid or missing access token'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {authError ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExternalLink className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Access Link Issue
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{authError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Your access link may have expired or been used already. Please contact support for a new link.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-600 mb-2">Need Help?</h4>
                      <p className="text-sm text-gray-600">
                        Contact our support team and we'll send you a fresh access link right away.
                      </p>
                    </div>
                  </div>
                </div>
              ) : !token ? (
                <div className="text-center space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExternalLink className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Invalid Access Link
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>This page requires a valid access token from your email or SMS.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-600 mb-2">How to Access</h4>
                    <p className="text-sm text-gray-600">
                      Use the secure link sent to your email or phone to access your portal.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Verifying Access</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Please wait while we authenticate your secure link...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {jobId && (
            <div className="text-center">
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">
                  You'll be redirected to your project details after authentication.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by Fixlify • Secure & Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
