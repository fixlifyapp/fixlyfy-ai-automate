
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
      
      // Call the portal-auth edge function with the token as a URL parameter
      const authUrl = `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/portal-auth?token=${encodeURIComponent(loginToken)}`;
      
      const authResponse = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg`,
        },
      });

      const authResult = await authResponse.json();

      if (!authResponse.ok || !authResult?.success) {
        console.error('Portal auth error:', authResult?.error);
        toast.error('Invalid or expired access link');
        return false;
      }

      setSession(authResult.session);
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
    // Redirect to the portal login page
    window.location.href = '/client-portal';
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
