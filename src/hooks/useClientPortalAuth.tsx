
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

      // Set context for RLS policies using direct SQL
      try {
        await supabase.rpc('set_config', {
          setting_name: 'app.current_client_id',
          setting_value: sessionData.client_id
        });
        
        await supabase.rpc('set_config', {
          setting_name: 'app.current_client_portal_user_id',
          setting_value: sessionData.user_id
        });
      } catch (configError) {
        // If set_config fails, continue anyway as the session is still valid
        console.warn('Could not set session config:', configError);
      }

    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('client_portal_session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.rpc('generate_client_login_token', {
        p_email: email
      });

      if (error) {
        return { success: false, message: 'Failed to generate login link' };
      }

      if (!data) {
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
        return { success: false, message: 'Failed to send login email' };
      }

      return { success: true, message: 'Login link sent to your email' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, message: 'An error occurred' };
    }
  };

  const verifyToken = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.rpc('verify_client_login_token', {
        p_token: token
      });

      if (error || !data || data.length === 0) {
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
      
      // Refresh session to get full user data
      await checkSession();

      return { success: true, message: 'Successfully logged in' };
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, message: 'Failed to verify login link' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('client_portal_session');
    setUser(null);
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
