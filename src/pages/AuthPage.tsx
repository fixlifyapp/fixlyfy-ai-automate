
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { SecureFormInput } from "@/components/ui/secure-form-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePasswordStrength, authRateLimiter, getGenericErrorMessage, logSecurityEvent } from "@/utils/security";

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [rateLimitBlocked, setRateLimitBlocked] = useState(false);

  useEffect(() => {
    // Check if user is rate limited on component mount
    const checkRateLimit = () => {
      const isAllowed = authRateLimiter.isAllowed('auth_attempt');
      setRateLimitBlocked(!isAllowed);
      
      if (!isAllowed) {
        const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
        const minutes = Math.ceil(remainingTime / (1000 * 60));
        toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
      }
    };

    checkRateLimit();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authRateLimiter.isAllowed('auth_attempt')) {
      const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
      const minutes = Math.ceil(remainingTime / (1000 * 60));
      toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    
    setLoading(true);
    
    try {
      await logSecurityEvent('sign_in_attempt', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      if (error) {
        await logSecurityEvent('sign_in_failed', { email, error: error.message });
        toast.error("Sign in failed", {
          description: getGenericErrorMessage(error)
        });
        console.error("Sign in error:", error);
      } else if (data.session) {
        await logSecurityEvent('sign_in_success', { email });
        toast.success("Signed in successfully");
        navigate('/dashboard');
      }
    } catch (error: any) {
      await logSecurityEvent('sign_in_error', { email, error: error.message });
      toast.error("Unexpected error", {
        description: getGenericErrorMessage(error)
      });
      console.error("Sign in unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authRateLimiter.isAllowed('auth_attempt')) {
      const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
      const minutes = Math.ceil(remainingTime / (1000 * 60));
      toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
      return;
    }

    // Validate password strength
    const { isValid, errors } = validatePasswordStrength(password);
    if (!isValid) {
      toast.error("Password requirements not met", {
        description: errors[0]
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await logSecurityEvent('sign_up_attempt', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            // Can add additional user metadata here if needed
          },
          emailRedirectTo: window.location.origin + "/dashboard"
        }
      });
      
      if (error) {
        await logSecurityEvent('sign_up_failed', { email, error: error.message });
        toast.error("Sign up failed", {
          description: getGenericErrorMessage(error)
        });
        console.error("Sign up error:", error);
      } else if (data.user) {
        await logSecurityEvent('sign_up_success', { email });
        
        // Automatically sign in after sign up
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        
        if (signInError) {
          toast.error("Auto sign in failed", {
            description: "Account created, but we couldn't sign you in automatically. Please sign in manually."
          });
          setAuthTab("login");
        } else {
          toast.success("Account created successfully");
          setIsNewUser(true);
          setShowOnboarding(true);
        }
      }
    } catch (error: any) {
      await logSecurityEvent('sign_up_error', { email, error: error.message });
      toast.error("Unexpected error", {
        description: getGenericErrorMessage(error)
      });
      console.error("Sign up unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePasswordField = (password: string): string | null => {
    if (!password) return "Password is required";
    if (authTab === "register") {
      const { isValid, errors } = validatePasswordStrength(password);
      if (!isValid) return errors[0];
    }
    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-fixlify-bg">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-md fixlify-gradient flex items-center justify-center text-white font-bold text-xl mb-4">
              F
            </div>
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Fixlify
          </CardTitle>
          <CardDescription>
            Field service management simplified - Secure Login
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
                <SecureFormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                  customValidation={validateEmail}
                />
                <SecureFormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  showValidation={false}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-fixlify hover:bg-fixlify/90"
                  disabled={loading || rateLimitBlocked}
                >
                  {loading ? (
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
                <SecureFormInput
                  label="Email"
                  name="signup-email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                  customValidation={validateEmail}
                />
                <div className="space-y-2">
                  <SecureFormInput
                    label="Password"
                    name="signup-password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                    customValidation={validatePasswordField}
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-fixlify hover:bg-fixlify/90"
                  disabled={loading || rateLimitBlocked}
                >
                  {loading ? (
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
          <div className="flex items-center justify-center text-xs text-muted-foreground mb-2">
            <Shield className="h-3 w-3 mr-1" />
            <span>Protected by enterprise-grade security</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to Fixlify's Terms of Service and Privacy Policy.
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
