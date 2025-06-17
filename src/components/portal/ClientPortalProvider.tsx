
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
      console.log('🔐 Starting portal authentication...');
      
      if (!loginToken || loginToken.length < 10) {
        throw new Error('Invalid access link format');
      }

      console.log('📡 Calling portal-auth function...');
      const { data: authResult, error: authError } = await supabase.functions.invoke('portal-auth', {
        body: { token: loginToken }
      });

      console.log('🔐 Portal auth response:', { success: authResult?.success, error: authError });

      if (authError) {
        console.error('❌ Portal auth network error:', authError);
        throw new Error('Unable to connect to authentication service');
      }

      if (!authResult?.success) {
        console.error('❌ Portal auth failed:', authResult?.error);
        throw new Error(authResult?.error || 'Access link is invalid or expired');
      }

      console.log('✅ Portal authentication successful for:', authResult.session.email);
      setSession(authResult.session);
      setIsAuthenticated(true);
      
      // Load dashboard data
      await loadDashboardData(loginToken);
      
      return true;
    } catch (error: any) {
      console.error('💥 Login error:', error);
      const errorMessage = error?.message || 'Authentication failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      setSession(null);
      
      // Only show toast for non-network errors
      if (!errorMessage.includes('fetch') && !errorMessage.includes('connect')) {
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

      console.log('📊 Dashboard response:', { success: dashboardData?.success, error });

      if (error) {
        console.error('❌ Dashboard data network error:', error);
        throw new Error('Unable to load your data');
      }

      if (!dashboardData?.success) {
        console.error('❌ Dashboard data failed:', dashboardData?.error);
        throw new Error(dashboardData?.error || 'Failed to load dashboard data');
      }

      console.log('✅ Dashboard data loaded successfully');
      setData(dashboardData.data);
    } catch (error: any) {
      console.error('💥 Dashboard data error:', error);
      const errorMessage = error?.message || 'Failed to load your information';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out of client portal');
    setSession(null);
    setData(null);
    setIsAuthenticated(false);
    setError(null);
    setRetryCount(0);
    window.location.href = '/client-portal';
  };

  const refreshData = async () => {
    if (session?.token) {
      console.log('🔄 Refreshing portal data...');
      await loadDashboardData(session.token);
    }
  };

  const retryAuth = () => {
    if (token && retryCount < 3) {
      console.log('🔄 Retrying authentication, attempt:', retryCount + 1);
      setRetryCount(prev => prev + 1);
      setError(null);
      login(token);
    } else {
      setError('Maximum retry attempts reached. Please try a new access link.');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    if (token) {
      console.log('🚀 Initializing client portal with token');
      login(token).then(success => {
        if (!mounted) return;
        
        if (!success && retryCount === 0) {
          // Auto-retry once for network issues
          console.log('🔄 Auto-retrying authentication...');
          setTimeout(() => {
            if (mounted) retryAuth();
          }, 2000);
        }
      });
    } else {
      console.log('⚠️ No access token provided');
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
