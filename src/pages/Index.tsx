
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    console.log('🏠 Index page state:', { 
      loading, 
      isAuthenticated, 
      hasUser: !!user, 
      error,
      redirecting 
    });

    if (!loading && !redirecting) {
      setRedirecting(true);
      
      if (isAuthenticated && user) {
        console.log('✅ User authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('❌ User not authenticated, redirecting to auth');
        navigate('/auth', { replace: true });
      }
    }
  }, [user, loading, isAuthenticated, navigate, redirecting]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
        <div className="text-center max-w-md">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-fixlyfy-text-secondary mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-fixlyfy hover:bg-fixlyfy/90"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
      <div className="text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
        <p className="text-fixlyfy-text-secondary">
          {loading ? 'Checking authentication...' : 'Redirecting...'}
        </p>
        <div className="mt-4 text-xs text-gray-500">
          <p>Debug: Loading={loading ? 'true' : 'false'}, Auth={isAuthenticated ? 'true' : 'false'}</p>
        </div>
      </div>
    </div>
  );
}
