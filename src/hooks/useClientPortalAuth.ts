
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ClientPortalUser {
  id: string;
  name: string;
  email: string;
  clientId: string;
}

interface ClientPortalAuthContext {
  user: ClientPortalUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const ClientPortalAuthContext = createContext<ClientPortalAuthContext | null>(null);

export const useClientPortalAuth = () => {
  const context = useContext(ClientPortalAuthContext);
  if (!context) {
    // Return a mock implementation for now
    const [user, setUser] = useState<ClientPortalUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      checkSession();
    }, []);

    const checkSession = async () => {
      try {
        const sessionToken = localStorage.getItem('client_portal_session');
        if (!sessionToken) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('client-portal-auth', {
          body: { action: 'validate_session' },
          headers: {
            'client-portal-session': sessionToken
          }
        });

        if (error || !data?.valid) {
          localStorage.removeItem('client_portal_session');
          setUser(null);
        } else {
          setUser({
            id: data.user_id,
            name: data.client_name,
            email: data.client_email,
            clientId: data.client_id
          });
        }
      } catch (error) {
        console.error('Error validating session:', error);
        localStorage.removeItem('client_portal_session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const signOut = async () => {
      localStorage.removeItem('client_portal_session');
      setUser(null);
    };

    return { user, loading, signOut };
  }
  return context;
};

export { ClientPortalAuthContext };
