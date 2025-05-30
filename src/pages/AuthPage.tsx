import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, Eye, EyeOff, Sparkles, Lock, Mail, AlertTriangle } from "lucide-react";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePasswordStrength, authRateLimiter, getGenericErrorMessage, logSecurityEvent } from "@/utils/security";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  console.log("AuthPage: Component rendering");
  
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [rateLimitBlocked, setRateLimitBlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Handle initial page load with connection retry
  useEffect(() => {
    console.log("AuthPage: Initial load, checking connection");
    
    const checkConnection = async () => {
      try {
        // Try to ping Supabase to check connection
        const { data, error } = await supabase.auth.getSession();
        console.log("AuthPage: Connection test result:", { data: !!data, error: !!error });
        
        if (error && error.message.includes('Failed to fetch')) {
          console.error("AuthPage: Connection failed:", error);
          setConnectionError(true);
        } else {
          setConnectionError(false);
        }
      } catch (error) {
        console.error("AuthPage: Connection test failed:", error);
        setConnectionError(true);
      } finally {
        setPageLoading(false);
      }
    };

    const timer = setTimeout(() => {
      checkConnection();
    }, 1000); // Give a moment for initial setup
    
    return () => clearTimeout(timer);
  }, [retryCount]);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("AuthPage: useEffect - checking auth state", { 
      user: !!user, 
      session: !!session, 
      loading,
      pageLoading,
      connectionError,
      userId: user?.id 
    });
    
    if (!loading && !pageLoading && !connectionError && user && session) {
      console.log("AuthPage: User is authenticated, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, session, loading, pageLoading, connectionError, navigate]);

  // Rate limiting check
  useEffect(() => {
    if (!pageLoading && !connectionError) {
      try {
        const isAllowed = authRateLimiter.isAllowed('auth_attempt');
        setRateLimitBlocked(!isAllowed);
        
        if (!isAllowed) {
          const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
          const minutes = Math.ceil(remainingTime / (1000 * 60));
          console.warn("AuthPage: Rate limit exceeded, blocked for", minutes, "minutes");
          toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
        }
      } catch (error) {
        console.error("AuthPage: Rate limit check failed:", error);
      }
    }
  }, [pageLoading, connectionError]);

  const retryConnection = () => {
    console.log("AuthPage: Retrying connection");
    setPageLoading(true);
    setConnectionError(false);
    setRetryCount(prev => prev + 1);
  };

  const proceedOffline = () => {
    console.log("AuthPage: Proceeding in offline mode");
    setConnectionError(false);
    setPageLoading(false);
    toast.info("Proceeding in demo mode - authentication is disabled");
  };

  const handleGoogleSignIn = async () => {
    console.log("AuthPage: Google sign-in initiated");
    
    try {
      if (!authRateLimiter.isAllowed('auth_attempt')) {
        const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
        const minutes = Math.ceil(remainingTime / (1000 * 60));
        console.warn("AuthPage: Google sign-in blocked by rate limiter");
        toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
        return;
      }
    } catch (error) {
      console.error("AuthPage: Rate limiter error:", error);
    }

    setGoogleLoading(true);
    
    try {
      console.log("AuthPage: Logging Google sign-in attempt");
      await logSecurityEvent('google_signin_attempt', {});
      
      console.log("AuthPage: Calling supabase.auth.signInWithOAuth");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        console.error("AuthPage: Google sign-in error:", error);
        await logSecurityEvent('google_signin_failed', { error: error.message });
        toast.error("Google sign in failed", {
          description: getGenericErrorMessage(error)
        });
      } else {
        console.log("AuthPage: Google sign-in successful, redirecting");
        toast.success("Redirecting to Google...");
      }
    } catch (error: any) {
      console.error("AuthPage: Google sign-in unexpected error:", error);
      await logSecurityEvent('google_signin_error', { error: error.message });
      toast.error("Unexpected error", {
        description: "Failed to sign in with Google"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthPage: Sign-in form submitted with email:", email);
    
    if (!email || !password) {
      console.warn("AuthPage: Sign-in attempted with missing credentials");
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      if (!authRateLimiter.isAllowed('auth_attempt')) {
        const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
        const minutes = Math.ceil(remainingTime / (1000 * 60));
        console.warn("AuthPage: Sign-in blocked by rate limiter");
        toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
        return;
      }
    } catch (error) {
      console.error("AuthPage: Rate limiter error:", error);
    }
    
    setAuthLoading(true);
    console.log("AuthPage: Starting sign-in process");
    
    try {
      await logSecurityEvent('sign_in_attempt', { email });
      
      console.log("AuthPage: Calling supabase.auth.signInWithPassword");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      if (error) {
        console.error("AuthPage: Sign-in error:", error);
        await logSecurityEvent('sign_in_failed', { email, error: error.message });
        toast.error("Sign in failed", {
          description: getGenericErrorMessage(error)
        });
      } else if (data.user && data.session) {
        console.log("AuthPage: Sign-in successful for user:", data.user.id);
        await logSecurityEvent('sign_in_success', { email });
        toast.success("Signed in successfully");
        
        // The useEffect above will handle the redirect once the auth context is updated
      }
    } catch (error: any) {
      console.error("AuthPage: Sign-in unexpected error:", error);
      await logSecurityEvent('sign_in_error', { email, error: error.message });
      toast.error("Unexpected error", {
        description: getGenericErrorMessage(error)
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthPage: Sign-up form submitted with email:", email);
    
    if (!email || !password) {
      console.warn("AuthPage: Sign-up attempted with missing credentials");
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      if (!authRateLimiter.isAllowed('auth_attempt')) {
        const remainingTime = authRateLimiter.getRemainingTime('auth_attempt');
        const minutes = Math.ceil(remainingTime / (1000 * 60));
        console.warn("AuthPage: Sign-up blocked by rate limiter");
        toast.error(`Too many attempts. Please try again in ${minutes} minutes.`);
        return;
      }
    } catch (error) {
      console.error("AuthPage: Rate limiter error:", error);
    }

    // Validate password strength
    try {
      const { isValid, errors } = validatePasswordStrength(password);
      if (!isValid) {
        console.warn("AuthPage: Password validation failed:", errors);
        toast.error("Password requirements not met", {
          description: errors[0]
        });
        return;
      }
    } catch (error) {
      console.error("AuthPage: Password validation error:", error);
      toast.error("Password validation failed");
      return;
    }
    
    setAuthLoading(true);
    console.log("AuthPage: Starting sign-up process");
    
    try {
      await logSecurityEvent('sign_up_attempt', { email });
      
      console.log("AuthPage: Calling supabase.auth.signUp");
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error("AuthPage: Sign-up error:", error);
        await logSecurityEvent('sign_up_failed', { email, error: error.message });
        toast.error("Sign up failed", {
          description: getGenericErrorMessage(error)
        });
      } else if (data.user) {
        console.log("AuthPage: Sign-up successful for user:", data.user.id);
        await logSecurityEvent('sign_up_success', { email });
        
        if (data.session) {
          console.log("AuthPage: User automatically signed in, showing onboarding");
          toast.success("Account created successfully");
          setIsNewUser(true);
          setShowOnboarding(true);
        } else {
          console.log("AuthPage: Email confirmation required");
          toast.success("Account created! Please check your email to confirm your account.");
          setAuthTab("login");
        }
      }
    } catch (error: any) {
      console.error("AuthPage: Sign-up unexpected error:", error);
      await logSecurityEvent('sign_up_error', { email, error: error.message });
      toast.error("Unexpected error", {
        description: getGenericErrorMessage(error)
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    console.log("AuthPage: Onboarding completed, navigating to dashboard");
    setShowOnboarding(false);
    navigate('/dashboard');
  };

  // Show connection error state
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-400" />
            </div>
            <CardTitle className="text-2xl text-white">Connection Error</CardTitle>
            <CardDescription className="text-gray-300">
              Unable to connect to authentication service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-center text-sm">
              There seems to be a network connectivity issue. You can either retry the connection or proceed in demo mode.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={retryConnection}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button 
                onClick={proceedOffline}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Continue in Demo Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading spinner during initial page load
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("AuthPage: Rendering auth form");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    F
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-3xl flex items-center justify-center gap-2 text-white">
                <Shield className="h-6 w-6 text-green-400" />
                Fixlify
              </CardTitle>
              <CardDescription className="text-gray-300">
                Field service management simplified - Secure 3D Login
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={authTab} onValueChange={setAuthTab} defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                {/* Demo Notice */}
                <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <p className="text-blue-100 text-sm text-center">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Demo Mode: Authentication is currently disabled for testing
                  </p>
                </div>

                {/* Demo Login Button */}
                <Button 
                  type="button"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white mb-4"
                  onClick={() => {
                    console.log("AuthPage: Demo login clicked");
                    toast.success("Demo login successful");
                    navigate('/dashboard');
                  }}
                >
                  Continue to Dashboard (Demo)
                </Button>

                {/* Google Sign In Button */}
                <div className="mb-6">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 h-12 text-base font-medium relative z-20"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || rateLimitBlocked || authLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-gray-400">Or continue with email</span>
                    </div>
                  </div>
                </div>

                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-30" />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm relative z-20"
                          required
                          disabled={authLoading || googleLoading}
                          aria-label="Email address"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-30" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm relative z-20"
                          required
                          disabled={authLoading || googleLoading}
                          aria-label="Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white z-30"
                          disabled={authLoading || googleLoading}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg h-12 text-base font-medium relative z-20"
                      disabled={authLoading || rateLimitBlocked || googleLoading}
                      aria-label="Sign in"
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-30" />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm relative z-20"
                          required
                          disabled={authLoading || googleLoading}
                          aria-label="Email address"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-30" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm relative z-20"
                          required
                          disabled={authLoading || googleLoading}
                          aria-label="Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white z-30"
                          disabled={authLoading || googleLoading}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <PasswordStrengthIndicator password={password} />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg h-12 text-base font-medium relative z-20"
                      disabled={authLoading || rateLimitBlocked || googleLoading}
                      aria-label="Create account"
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
              <div className="flex items-center justify-center text-xs text-gray-400 mb-2">
                <Shield className="h-3 w-3 mr-1" />
                <span>Protected by enterprise-grade security</span>
              </div>
              <p className="text-xs text-center text-gray-400">
                By continuing, you agree to Fixlify's Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Onboarding Modal for new users */}
        <OnboardingModal 
          open={showOnboarding} 
          onOpenChange={setShowOnboarding}
        />
      </div>
    </>
  );
}
