
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const navigate = useNavigate();

  const handleBypassAuth = () => {
    // Just navigate to dashboard without authentication for now
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-md fixlyfy-gradient flex items-center justify-center text-white font-bold text-xl mb-4">
              F
            </div>
          </div>
          <CardTitle className="text-2xl">Fixlyfy</CardTitle>
          <p className="text-muted-foreground">Authentication temporarily disabled</p>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 pt-4">
          <Button 
            onClick={handleBypassAuth} 
            className="w-full bg-fixlyfy hover:bg-fixlyfy/90"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
