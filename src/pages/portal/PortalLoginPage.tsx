
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, signIn, verifyToken } = useClientPortalAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenProcessing, setTokenProcessing] = useState(false);

  const token = searchParams.get('token');
  const redirectTo = searchParams.get('redirect');

  // If user is already logged in, redirect
  useEffect(() => {
    if (user && !loading) {
      const destination = redirectTo || '/portal/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  // Handle token-based login
  useEffect(() => {
    if (token && !user && !loading) {
      handleTokenLogin();
    }
  }, [token, user, loading]);

  const handleTokenLogin = async () => {
    if (!token) return;
    
    setTokenProcessing(true);
    try {
      const result = await verifyToken(token);
      if (result.success) {
        toast.success('Successfully logged in!');
        // Navigate after successful login
        setTimeout(() => {
          const destination = redirectTo || '/portal/dashboard';
          navigate(destination, { replace: true });
        }, 500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to verify login link');
    } finally {
      setTokenProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email);
      if (result.success) {
        toast.success(result.message);
        setEmail('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || tokenProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-fixlyfy" />
          <p className="text-gray-600">
            {tokenProcessing ? 'Verifying login link...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

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
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-fixlyfy" />
              Sign In
            </CardTitle>
            <CardDescription>
              {token 
                ? 'Processing your login link...' 
                : 'Enter your email to receive a secure login link'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-fixlyfy hover:bg-fixlyfy/90" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Login Link...
                    </>
                  ) : (
                    'Send Login Link'
                  )}
                </Button>
              </form>
            )}

            {token && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-fixlyfy" />
                <p className="text-gray-600">Verifying your login link...</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Having trouble? Contact support for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
