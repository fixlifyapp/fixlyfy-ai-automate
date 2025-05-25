
import { useEffect, useCallback } from 'react';
import { useGlobalRealtime } from '@/contexts/GlobalRealtimeProvider';

interface UseUnifiedRealtimeProps {
  tables: ('jobs' | 'clients' | 'messages' | 'invoices' | 'payments' | 'estimates' | 'jobHistory' | 'job_custom_field_values' | 'tags' | 'job_types' | 'job_statuses' | 'custom_fields' | 'lead_sources')[];
  onUpdate: () => void;
  enabled?: boolean;
}

export const useUnifiedRealtime = ({ tables, onUpdate, enabled = true }: UseUnifiedRealtimeProps) => {
  const globalRealtime = useGlobalRealtime();
  
  const handleUpdate = useCallback(() => {
    if (enabled) {
      onUpdate();
    }
  }, [onUpdate, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Register callback for each table
    const unsubscribeFunctions: (() => void)[] = [];

    tables.forEach(table => {
      // Add callback to the global realtime system
      const refreshCallbacks = (globalRealtime as any).refreshCallbacks;
      if (refreshCallbacks && refreshCallbacks[table]) {
        refreshCallbacks[table].add(handleUpdate);
        
        unsubscribeFunctions.push(() => {
          refreshCallbacks[table].delete(handleUpdate);
        });
      }
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [tables, handleUpdate, enabled, globalRealtime]);

  return {
    isConnected: globalRealtime.isConnected
  };
};
