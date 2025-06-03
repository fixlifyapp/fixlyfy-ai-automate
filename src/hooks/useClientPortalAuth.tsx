
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

      const response = await fetch('/supabase/functions/v1/client-portal-estimates', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        localStorage.removeItem('client_portal_session');
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.client) {
        setUser({
          id: data.client.id,
          clientId: data.client.id,
          name: data.client.name,
          email: data.client.email
        });
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
      const response = await fetch('/supabase/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'client_portal_login',
          email: email
        })
      });

      if (!response.ok) {
        return { success: false, message: 'Failed to send login link' };
      }

      return { success: true, message: 'Login link sent to your email' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, message: 'An error occurred' };
    }
  };

  const verifyToken = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
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

      if (!response.ok) {
        return { success: false, message: 'Invalid or expired login link' };
      }

      const data = await response.json();
      if (data.session_token) {
        localStorage.setItem('client_portal_session', data.session_token);
        
        // Set user data
        const userData = {
          id: data.user_id,
          clientId: data.client_id,
          name: data.client_name || '',
          email: data.client_email || ''
        };
        
        setUser(userData);
        
        // Refresh session to get full user data
        await checkSession();

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
