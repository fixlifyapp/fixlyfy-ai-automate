
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
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  const login = async (loginToken: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Starting portal authentication with token:', loginToken.substring(0, 10) + '...');
      
      // Call the portal-auth edge function with POST method and proper body
      console.log('📡 Calling portal-auth edge function...');
      const { data: authResult, error: authError } = await supabase.functions.invoke('portal-auth', {
        body: { token: loginToken }
      });

      console.log('🔐 Portal auth response:', authResult, authError);

      if (authError) {
        console.error('❌ Portal auth error:', authError);
        const errorMessage = `Authentication failed: ${authError.message}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      if (!authResult?.success) {
        console.error('❌ Portal auth failed:', authResult?.error);
        const errorMessage = authResult?.error || 'Invalid or expired access link';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      setSession(authResult.session);
      setIsAuthenticated(true);
      console.log('✅ Portal authentication successful');
      
      // Load dashboard data
      await loadDashboardData(loginToken);
      
      return true;
    } catch (error: any) {
      console.error('💥 Login error:', error);
      const errorMessage = `Authentication failed: ${error.message || 'Unknown error'}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (authToken: string) => {
    try {
      console.log('📊 Loading dashboard data...');
      
      const { data: dashboardData, error } = await supabase.functions.invoke('portal-dashboard', {
        body: { token: authToken }
      });

      console.log('📊 Dashboard response:', dashboardData, error);

      if (error) {
        console.error('❌ Dashboard data error:', error);
        const errorMessage = `Failed to load dashboard data: ${error.message}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (!dashboardData?.success) {
        console.error('❌ Dashboard data failed:', dashboardData?.error);
        const errorMessage = dashboardData?.error || 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setData(dashboardData.data);
      console.log('✅ Dashboard data loaded successfully');
    } catch (error: any) {
      console.error('💥 Dashboard data error:', error);
      const errorMessage = `Failed to load dashboard data: ${error.message || 'Unknown error'}`;
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    setSession(null);
    setData(null);
    setIsAuthenticated(false);
    setError(null);
    // Redirect to the portal login page instead of /auth
    window.location.href = '/client-portal';
  };

  const refreshData = async () => {
    if (session?.token) {
      await loadDashboardData(session.token);
    }
  };

  useEffect(() => {
    if (token) {
      console.log('🚀 Starting portal authentication process with token:', token.substring(0, 10) + '...');
      login(token);
    } else {
      console.log('⚠️ No token provided');
      setIsLoading(false);
    }
  }, [token]);

  const value = {
    session,
    data,
    isLoading,
    isAuthenticated,
    error,
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
