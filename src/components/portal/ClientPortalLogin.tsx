
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientPortal } from './ClientPortalProvider';
import { toast } from 'sonner';

export function ClientPortalLogin() {
  const [tokenInput, setTokenInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useClientPortal();

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast.error('Please enter your access token');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(tokenInput.trim());
      if (!success) {
        toast.error('Invalid access token');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Portal</h1>
          <p className="text-gray-600">Access your service information</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">
              Secure Access
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Use the access link sent to your email or enter your token below
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleTokenLogin} className="space-y-4">
              <div>
                <Label htmlFor="token" className="text-sm font-medium text-gray-700">
                  Access Token
                </Label>
                <Input
                  id="token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Enter your access token"
                  className="mt-1"
                  disabled={isLoggingIn}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-fixlyfy hover:bg-fixlyfy/90"
                disabled={isLoggingIn || !tokenInput.trim()}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing In...
                  </div>
                ) : (
                  'Access Portal'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Don't have an access link?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Contact our support team for assistance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Fixlyfy Services. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
