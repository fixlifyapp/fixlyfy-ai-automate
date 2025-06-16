
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
  retryAuth: () => void;
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
  const [retryCount, setRetryCount] = useState(0);

  const login = async (loginToken: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Starting portal authentication with token:', loginToken.substring(0, 10) + '...');
      
      // Validate token format
      if (!loginToken || loginToken.length < 10) {
        throw new Error('Invalid token format');
      }

      console.log('📡 Calling portal-auth edge function...');
      const { data: authResult, error: authError } = await supabase.functions.invoke('portal-auth', {
        body: { token: loginToken }
      });

      console.log('🔐 Portal auth response:', authResult, authError);

      if (authError) {
        console.error('❌ Portal auth error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authResult?.success) {
        console.error('❌ Portal auth failed:', authResult?.error);
        throw new Error(authResult?.error || 'Invalid or expired access link');
      }

      setSession(authResult.session);
      setIsAuthenticated(true);
      console.log('✅ Portal authentication successful');
      
      // Load dashboard data
      await loadDashboardData(loginToken);
      
      return true;
    } catch (error: any) {
      console.error('💥 Login error:', error);
      const errorMessage = error?.message || 'Authentication failed';
      setError(errorMessage);
      
      // Don't show toast for network errors during initial load
      if (!errorMessage.includes('fetch')) {
        toast.error(errorMessage);
      }
      
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
        throw new Error(`Failed to load dashboard data: ${error.message}`);
      }

      if (!dashboardData?.success) {
        console.error('❌ Dashboard data failed:', dashboardData?.error);
        throw new Error(dashboardData?.error || 'Failed to load dashboard data');
      }

      setData(dashboardData.data);
      console.log('✅ Dashboard data loaded successfully');
    } catch (error: any) {
      console.error('💥 Dashboard data error:', error);
      const errorMessage = error?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    setSession(null);
    setData(null);
    setIsAuthenticated(false);
    setError(null);
    setRetryCount(0);
    window.location.href = '/client-portal';
  };

  const refreshData = async () => {
    if (session?.token) {
      await loadDashboardData(session.token);
    }
  };

  const retryAuth = () => {
    if (token && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      login(token);
    } else {
      setError('Maximum retry attempts reached. Please check your link.');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    if (token) {
      console.log('🚀 Starting portal authentication process with token:', token.substring(0, 10) + '...');
      login(token).then(success => {
        if (!mounted) return;
        if (!success && retryCount < 2) {
          // Auto-retry once for network issues
          setTimeout(() => {
            if (mounted) retryAuth();
          }, 1000);
        }
      });
    } else {
      console.log('⚠️ No token provided');
      setIsLoading(false);
      setError('No access token provided');
    }
    
    return () => {
      mounted = false;
    };
  }, [token]);

  const value = {
    session,
    data,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refreshData,
    retryAuth
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
