
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Redirect based on auth state
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
      <div className="text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
        <p className="text-fixlyfy-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
