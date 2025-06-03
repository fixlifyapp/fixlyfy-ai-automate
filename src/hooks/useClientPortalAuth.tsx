
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

      const response = await fetch('/supabase/functions/v1/client-portal-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'validate_session'
        })
      });

      console.log('Session validation response status:', response.status);

      if (!response.ok) {
        console.log('Session validation failed, clearing session');
        localStorage.removeItem('client_portal_session');
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Session validation data:', data);
      
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
      
      const response = await fetch('/supabase/functions/v1/client-portal-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'generate_login_token',
          email: email
        })
      });

      console.log('Token generation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token generation failed:', errorData);
        return { success: false, message: errorData.error || 'Failed to send login link' };
      }

      const data = await response.json();
      console.log('Token generated successfully');

      // Send the login email using the send-email function
      const emailResponse = await fetch('/supabase/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'client_portal_login',
          email: email,
          token: data.token
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send login email');
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
      
      const response = await fetch('/supabase/functions/v1/client-portal-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'verify_token',
          token: token
        })
      });

      console.log('Token verification response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token verification failed:', errorData);
        return { success: false, message: errorData.error || 'Invalid or expired login link' };
      }

      const data = await response.json();
      console.log('Token verification successful:', data);
      
      if (data.session_token) {
        localStorage.setItem('client_portal_session', data.session_token);
        
        // Set user data immediately
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
