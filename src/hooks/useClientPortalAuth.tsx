
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ClientPortalUser {
  id: string;
  clientId: string;
  name: string;
  email: string;
}

interface ClientPortalAuthContextType {
  user: ClientPortalUser | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  verifyToken: (token: string) => Promise<{ success: boolean; message: string }>;
}

const ClientPortalAuthContext = createContext<ClientPortalAuthContextType | undefined>(undefined);

export function ClientPortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientPortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('client_portal_session');
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('validate_client_session', {
        p_session_token: sessionToken
      });

      if (error || !data || data.length === 0) {
        localStorage.removeItem('client_portal_session');
        setUser(null);
        
        // Log security event for invalid session
        await supabase.rpc('log_security_event', {
          p_action: 'client_portal_invalid_session',
          p_resource: 'client_portal_session',
          p_details: { error: error?.message || 'No session data' }
        });
        
        setLoading(false);
        return;
      }

      const sessionData = data[0];
      setUser({
        id: sessionData.user_id,
        clientId: sessionData.client_id,
        name: sessionData.client_name,
        email: sessionData.client_email
      });

      // Log successful session validation
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_session_validated',
        p_resource: 'client_portal_session',
        p_details: { client_id: sessionData.client_id }
      });

    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('client_portal_session');
      setUser(null);
      
      // Log security event for session check error
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_session_error',
        p_resource: 'client_portal_session',
        p_details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check rate limiting first
      const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_identifier: email,
        p_attempt_type: 'magic_link',
        p_max_attempts: 3,
        p_window_minutes: 60
      });

      if (rateLimitError || !rateLimitData) {
        await supabase.rpc('log_security_event', {
          p_action: 'client_portal_rate_limit_exceeded',
          p_resource: 'client_portal_auth',
          p_details: { email, type: 'magic_link' }
        });
        
        return { success: false, message: 'Too many login attempts. Please try again later.' };
      }

      const { data, error } = await supabase.rpc('generate_client_login_token', {
        p_email: email
      });

      if (error) {
        await supabase.rpc('log_security_event', {
          p_action: 'client_portal_login_failed',
          p_resource: 'client_portal_auth',
          p_details: { email, error: error.message }
        });
        
        return { success: false, message: 'Failed to generate login link' };
      }

      if (!data) {
        await supabase.rpc('log_security_event', {
          p_action: 'client_portal_login_no_account',
          p_resource: 'client_portal_auth',
          p_details: { email }
        });
        
        return { success: false, message: 'No account found with this email address' };
      }

      // Send the login link via email
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Your Client Portal Login Link',
          html: `
            <h2>Access Your Client Portal</h2>
            <p>Click the link below to access your client portal:</p>
            <a href="${window.location.origin}/portal/login?token=${data}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Portal
            </a>
            <p>This link will expire in 30 minutes for security.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `
        }
      });

      if (emailError) {
        console.error('Email send error:', emailError);
        await supabase.rpc('log_security_event', {
          p_action: 'client_portal_email_failed',
          p_resource: 'client_portal_auth',
          p_details: { email, error: emailError.message }
        });
        
        return { success: false, message: 'Failed to send login email' };
      }

      // Log successful login attempt
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_login_sent',
        p_resource: 'client_portal_auth',
        p_details: { email }
      });

      return { success: true, message: 'Login link sent to your email' };
    } catch (error) {
      console.error('Sign in error:', error);
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_signin_error',
        p_resource: 'client_portal_auth',
        p_details: { email, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return { success: false, message: 'An error occurred' };
    }
  };

  const verifyToken = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.rpc('verify_client_login_token', {
        p_token: token
      });

      if (error || !data || data.length === 0) {
        await supabase.rpc('log_security_event', {
          p_action: 'client_portal_token_invalid',
          p_resource: 'client_portal_auth',
          p_details: { error: error?.message || 'Invalid token' }
        });
        
        return { success: false, message: 'Invalid or expired login link' };
      }

      const sessionData = data[0];
      localStorage.setItem('client_portal_session', sessionData.session_token);
      
      // Set user data
      const userData = {
        id: sessionData.user_id,
        clientId: sessionData.client_id,
        name: '', // Will be filled by checkSession
        email: ''
      };
      
      setUser(userData);
      
      // Log successful token verification
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_token_verified',
        p_resource: 'client_portal_auth',
        p_details: { client_id: sessionData.client_id }
      });
      
      // Refresh session to get full user data
      await checkSession();

      return { success: true, message: 'Successfully logged in' };
    } catch (error) {
      console.error('Token verification error:', error);
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_token_error',
        p_resource: 'client_portal_auth',
        p_details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return { success: false, message: 'Failed to verify login link' };
    }
  };

  const signOut = async () => {
    const currentUser = user;
    localStorage.removeItem('client_portal_session');
    setUser(null);
    
    // Log signout event
    if (currentUser) {
      await supabase.rpc('log_security_event', {
        p_action: 'client_portal_signout',
        p_resource: 'client_portal_auth',
        p_details: { client_id: currentUser.clientId }
      });
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    verifyToken,
  };

  return (
    <ClientPortalAuthContext.Provider value={value}>
      {children}
    </ClientPortalAuthContext.Provider>
  );
}

export function useClientPortalAuth() {
  const context = useContext(ClientPortalAuthContext);
  if (context === undefined) {
    throw new Error('useClientPortalAuth must be used within a ClientPortalAuthProvider');
  }
  return context;
}
