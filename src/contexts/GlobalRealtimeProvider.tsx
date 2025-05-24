
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GlobalRealtimeContextType {
  refreshJobs: () => void;
  refreshClients: () => void;
  refreshMessages: () => void;
  refreshInvoices: () => void;
  refreshPayments: () => void;
  refreshEstimates: () => void;
  refreshJobHistory: () => void;
  isConnected: boolean;
}

const GlobalRealtimeContext = createContext<GlobalRealtimeContextType | undefined>(undefined);

export const useGlobalRealtime = () => {
  const context = useContext(GlobalRealtimeContext);
  if (!context) {
    throw new Error('useGlobalRealtime must be used within a GlobalRealtimeProvider');
  }
  return context;
};

interface GlobalRealtimeProviderProps {
  children: ReactNode;
}

export const GlobalRealtimeProvider = ({ children }: GlobalRealtimeProviderProps) => {
  const [refreshCallbacks, setRefreshCallbacks] = useState({
    jobs: new Set<() => void>(),
    clients: new Set<() => void>(),
    messages: new Set<() => void>(),
    invoices: new Set<() => void>(),
    payments: new Set<() => void>(),
    estimates: new Set<() => void>(),
    jobHistory: new Set<() => void>(),
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const setupRealtimeChannels = () => {
      // Single channel for all database changes
      const channel = supabase
        .channel('global-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'jobs'
          },
          (payload) => {
            console.log('Jobs table changed:', payload);
            refreshCallbacks.jobs.forEach(callback => callback());
            
            if (payload.eventType === 'INSERT') {
              toast.success('New job created');
            } else if (payload.eventType === 'UPDATE') {
              toast.info('Job updated');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients'
          },
          (payload) => {
            console.log('Clients table changed:', payload);
            refreshCallbacks.clients.forEach(callback => callback());
            
            if (payload.eventType === 'INSERT') {
              toast.success('New client added');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('Messages table changed:', payload);
            refreshCallbacks.messages.forEach(callback => callback());
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices'
          },
          (payload) => {
            console.log('Invoices table changed:', payload);
            refreshCallbacks.invoices.forEach(callback => callback());
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments'
          },
          (payload) => {
            console.log('Payments table changed:', payload);
            refreshCallbacks.payments.forEach(callback => callback());
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'estimates'
          },
          (payload) => {
            console.log('Estimates table changed:', payload);
            refreshCallbacks.estimates.forEach(callback => callback());
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'job_history'
          },
          (payload) => {
            console.log('Job history table changed:', payload);
            refreshCallbacks.jobHistory.forEach(callback => callback());
          }
        )
        .subscribe((status) => {
          console.log('Global realtime channel status:', status);
          setIsConnected(status === 'SUBSCRIBED');
          
          if (status === 'SUBSCRIBED') {
            toast.success('Real-time sync connected');
          } else if (status === 'CHANNEL_ERROR') {
            toast.error('Real-time sync error');
          }
        });

      return () => {
        supabase.removeChannel(channel);
        setIsConnected(false);
      };
    };

    const cleanup = setupRealtimeChannels();
    return cleanup;
  }, []);

  const registerRefreshCallback = (table: keyof typeof refreshCallbacks, callback: () => void) => {
    setRefreshCallbacks(prev => ({
      ...prev,
      [table]: new Set([...prev[table], callback])
    }));

    return () => {
      setRefreshCallbacks(prev => {
        const newSet = new Set(prev[table]);
        newSet.delete(callback);
        return {
          ...prev,
          [table]: newSet
        };
      });
    };
  };

  const contextValue: GlobalRealtimeContextType = {
    refreshJobs: () => refreshCallbacks.jobs.forEach(callback => callback()),
    refreshClients: () => refreshCallbacks.clients.forEach(callback => callback()),
    refreshMessages: () => refreshCallbacks.messages.forEach(callback => callback()),
    refreshInvoices: () => refreshCallbacks.invoices.forEach(callback => callback()),
    refreshPayments: () => refreshCallbacks.payments.forEach(callback => callback()),
    refreshEstimates: () => refreshCallbacks.estimates.forEach(callback => callback()),
    refreshJobHistory: () => refreshCallbacks.jobHistory.forEach(callback => callback()),
    isConnected
  };

  return (
    <GlobalRealtimeContext.Provider value={contextValue}>
      {children}
    </GlobalRealtimeContext.Provider>
  );
};

// Hook for components to register for specific table updates
export const useTableSync = (table: 'jobs' | 'clients' | 'messages' | 'invoices' | 'payments' | 'estimates' | 'jobHistory', callback: () => void) => {
  const context = useContext(GlobalRealtimeContext);
  
  useEffect(() => {
    if (!context) return;
    
    const refreshCallbacks = (context as any).refreshCallbacks;
    if (!refreshCallbacks || !refreshCallbacks[table]) return;
    
    refreshCallbacks[table].add(callback);
    
    return () => {
      refreshCallbacks[table].delete(callback);
    };
  }, [callback, table, context]);
};
