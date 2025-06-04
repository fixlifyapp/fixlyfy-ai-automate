
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TeamInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInvitation = async () => {
      if (!token) {
        setError("Invalid invitation token");
        setLoading(false);
        return;
      }

      try {
        // Process the invitation token
        console.log("Processing invitation token:", token);
        // Add your invitation processing logic here
        
        setLoading(false);
        navigate("/auth");
      } catch (error) {
        console.error("Error processing invitation:", error);
        setError("Failed to process invitation");
        setLoading(false);
      }
    };

    handleInvitation();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Processing your invitation...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/auth")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default TeamInvitePage;
