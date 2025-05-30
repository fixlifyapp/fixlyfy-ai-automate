
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!user) {
        navigate('/auth');
      }
    }, 3000);

    // Redirect based on auth state when not loading
    if (!loading) {
      clearTimeout(timeoutId);
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }

    return () => clearTimeout(timeoutId);
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-white mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
