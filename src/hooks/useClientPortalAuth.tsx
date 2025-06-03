
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientPortalUser {
  id: string;
  clientId: string;
  name: string;
  email: string;
  resourceType?: string;
  resourceId?: string;
}

interface ClientPortalAuthContextType {
  user: ClientPortalUser | null;
  loading: boolean;
  authenticateWithToken: (token: string) => Promise<{ success: boolean; message: string; resourceType?: string; resourceId?: string }>;
  signOut: () => Promise<void>;
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

      console.log('Checking client portal session...');

      const { data, error } = await supabase.functions.invoke('client-portal-auth', {
        body: {
          action: 'validate_session',
          session_token: sessionToken
        }
      });

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

  const authenticateWithToken = async (token: string): Promise<{ success: boolean; message: string; resourceType?: string; resourceId?: string }> => {
    try {
      console.log('Authenticating with token:', token.substring(0, 20) + '...');
      
      const { data, error } = await supabase.functions.invoke('client-portal-auth', {
        body: {
          action: 'authenticate_token',
          token: token
        }
      });

      if (error || !data?.success) {
        console.error('Token authentication failed:', error);
        return { success: false, message: error?.message || 'Invalid or expired access link' };
      }
      
      if (data.session_token) {
        localStorage.setItem('client_portal_session', data.session_token);
        
        const userData = {
          id: data.client_id,
          clientId: data.client_id,
          name: data.client_name || 'Client',
          email: data.client_email || '',
          resourceType: data.resource_type,
          resourceId: data.resource_id
        };
        
        setUser(userData);
        console.log('User authenticated:', userData);

        return { 
          success: true, 
          message: 'Successfully authenticated',
          resourceType: data.resource_type,
          resourceId: data.resource_id
        };
      }

      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Token authentication error:', error);
      return { success: false, message: 'Failed to authenticate access link' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('client_portal_session');
    setUser(null);
  };

  const value = {
    user,
    loading,
    authenticateWithToken,
    signOut,
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
