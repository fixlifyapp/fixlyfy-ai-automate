
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClientPortalAuth } from "@/hooks/useClientPortalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, verifyToken, user, loading: authLoading } = useClientPortalAuth();
  
  const token = searchParams.get('token');

  useEffect(() => {
    console.log('PortalLoginPage: user:', user, 'authLoading:', authLoading, 'token:', token);
    
    if (!authLoading && user) {
      console.log('User is already logged in, redirecting to dashboard');
      navigate('/portal/dashboard');
      return;
    }

    if (token && !authLoading) {
      console.log('Token found in URL, attempting verification');
      handleTokenVerification(token);
    }
  }, [token, user, authLoading, navigate]);

  const handleTokenVerification = async (token: string) => {
    console.log('Starting token verification for token:', token.substring(0, 20) + '...');
    setIsLoading(true);
    
    try {
      const result = await verifyToken(token);
      console.log('Token verification result:', result);
      
      if (result.success) {
        toast.success(result.message);
        console.log('Token verification successful, redirecting to dashboard');
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate('/portal/dashboard');
        }, 100);
      } else {
        toast.error(result.message);
        console.log('Token verification failed:', result.message);
      }
    } catch (error) {
      console.error('Error during token verification:', error);
      toast.error('Failed to verify login link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const result = await signIn(email);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  // Show loading spinner while checking auth state or verifying token
  if (authLoading || (token && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {token ? 'Verifying your login...' : 'Loading...'}
            </h2>
            <p className="text-gray-600">
              {token ? 'Please wait while we verify your login link.' : 'Please wait...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Client Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to receive a secure login link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Login Link
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-800 mb-1">🔒 Secure Access</p>
            <p>No password required! We'll send you a secure link to access your portal.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
