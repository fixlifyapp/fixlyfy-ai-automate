
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      console.log('Checking session with token:', sessionToken.substring(0, 20) + '...');

      const { data, error } = await supabase.functions.invoke('client-portal-auth', {
        body: {
          action: 'validate_session',
          session_token: sessionToken
        }
      });

      console.log('Session validation response:', data);

      if (error || !data?.valid) {
        console.log('Session validation failed, clearing session');
        localStorage.removeItem('client_portal_session');
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (data.valid && data.client_id) {
        setUser({
          id: data.client_id,
          clientId: data.client_id,
          name: data.client_name || 'Client',
          email: data.client_email || ''
        });
      } else {
        localStorage.removeItem('client_portal_session');
        setUser(null);
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
      console.log('Generating login token for:', email);
      
      const { data, error } = await supabase.functions.invoke('client-portal-auth', {
        body: {
          action: 'generate_login_token',
          email: email
        }
      });

      console.log('Token generation response:', data);

      if (error || !data?.token) {
        console.error('Token generation failed:', error);
        return { success: false, message: error?.message || 'Failed to send login link' };
      }

      // Send the login email using the send-email function
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: {
          type: 'client_portal_login',
          email: email,
          token: data.token
        }
      });

      if (emailResponse.error) {
        console.error('Failed to send login email:', emailResponse.error);
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
      console.log('Verifying token:', token.substring(0, 20) + '...');
      
      const { data, error } = await supabase.functions.invoke('client-portal-auth', {
        body: {
          action: 'verify_token',
          token: token
        }
      });

      console.log('Token verification response:', data);

      if (error || !data?.session_token) {
        console.error('Token verification failed:', error);
        return { success: false, message: error?.message || 'Invalid or expired login link' };
      }
      
      if (data.session_token) {
        localStorage.setItem('client_portal_session', data.session_token);
        
        const userData = {
          id: data.client_id,
          clientId: data.client_id,
          name: data.client_name || 'Client',
          email: data.client_email || ''
        };
        
        setUser(userData);
        console.log('User set:', userData);

        return { success: true, message: 'Successfully logged in' };
      }

      return { success: false, message: 'Invalid response from server' };
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
