
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PortalSession {
  user_id: string;
  client_id: string;
  email: string;
  name: string;
  document_type?: string;
  document_id?: string;
  token: string;
}

interface PortalData {
  client: any;
  jobs: any[];
  estimates: any[];
  invoices: any[];
  payments: any[];
  activities: any[];
  session: PortalSession;
}

interface ClientPortalContextType {
  session: PortalSession | null;
  data: PortalData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const ClientPortalContext = createContext<ClientPortalContextType | undefined>(undefined);

export function ClientPortalProvider({ 
  children, 
  token 
}: { 
  children: ReactNode; 
  token: string | null;
}) {
  const [session, setSession] = useState<PortalSession | null>(null);
  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (loginToken: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data: authData, error } = await supabase.functions.invoke('portal-auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: loginToken })
      });

      if (error || !authData?.success) {
        console.error('Portal auth error:', error || authData?.error);
        toast.error('Invalid or expired link');
        return false;
      }

      setSession(authData.session);
      setIsAuthenticated(true);
      
      // Load dashboard data
      await loadDashboardData(loginToken);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (authToken: string) => {
    try {
      const { data: dashboardData, error } = await supabase.functions.invoke('portal-dashboard', {
        body: { token: authToken }
      });

      if (error || !dashboardData?.success) {
        console.error('Dashboard data error:', error || dashboardData?.error);
        toast.error('Failed to load dashboard data');
        return;
      }

      setData(dashboardData.data);
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const logout = () => {
    setSession(null);
    setData(null);
    setIsAuthenticated(false);
    // Redirect to a public page or show login form
    window.location.href = '/';
  };

  const refreshData = async () => {
    if (session?.token) {
      await loadDashboardData(session.token);
    }
  };

  useEffect(() => {
    if (token) {
      login(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const value = {
    session,
    data,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshData
  };

  return (
    <ClientPortalContext.Provider value={value}>
      {children}
    </ClientPortalContext.Provider>
  );
}

export function useClientPortal() {
  const context = useContext(ClientPortalContext);
  if (context === undefined) {
    throw new Error('useClientPortal must be used within a ClientPortalProvider');
  }
  return context;
}
