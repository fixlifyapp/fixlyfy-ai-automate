
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  console.log('🔐 AuthPage render state:', { user: !!user, loading, authLoading });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log("✅ User is authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔑 Attempting sign in with email:", email);
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log("🔐 Sign in response:", { data: !!data, error });
      
      if (error) {
        console.error("❌ Sign in error:", error);
        toast.error("Sign in failed", {
          description: error.message
        });
      } else if (data.session) {
        console.log("✅ Sign in successful");
        toast.success("Signed in successfully");
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("💥 Sign in unexpected error:", error);
      toast.error("Unexpected error", {
        description: "Please try again later"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Attempting sign up with email:", email);
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      console.log("📝 Sign up response:", { data: !!data, error });
      
      if (error) {
        console.error("❌ Sign up error:", error);
        toast.error("Sign up failed", {
          description: error.message
        });
      } else if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          console.log("✅ Sign up and auto sign in successful");
          toast.success("Account created and signed in successfully");
          setIsNewUser(true);
          setShowOnboarding(true);
        } else {
          console.log("📧 Sign up successful, email confirmation required");
          toast.success("Account created successfully", {
            description: "Please check your email to confirm your account"
          });
          setAuthTab("login");
        }
      }
    } catch (error: any) {
      console.error("💥 Sign up unexpected error:", error);
      toast.error("Unexpected error", {
        description: "Please try again later"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-fixlyfy-bg">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
          <p className="text-fixlyfy-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

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
          <CardDescription>
            Field service management simplified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authTab} onValueChange={setAuthTab} defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={authLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-fixlyfy hover:bg-fixlyfy/90"
                  disabled={authLoading || !email || !password}
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={authLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-fixlyfy hover:bg-fixlyfy/90"
                  disabled={authLoading || !email || !password}
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-muted-foreground">
            By continuing, you agree to Fixlyfy's Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>

      {/* Onboarding Modal for new users */}
      <OnboardingModal 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding} 
      />
    </div>
  );
}
