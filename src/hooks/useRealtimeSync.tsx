
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to set up real-time subscriptions to Supabase tables
 * 
 * @param options Configuration options for real-time subscriptions
 * @param options.tables Array of tables to subscribe to
 * @param options.onUpdate Callback function to run when changes occur
 * @param options.filter Optional filter to apply to subscriptions
 */
export const useRealtimeSync = ({
  tables,
  onUpdate,
  filter,
  enabled = true
}: {
  tables: string[];
  onUpdate: () => void;
  filter?: Record<string, any>;
  enabled?: boolean;
}) => {
  useEffect(() => {
    if (!enabled) return;
    
    // Store all channels so we can clean them up later
    const channels = tables.map(table => {
      // Create filter string if filter is provided
      let filterString = undefined;
      if (filter) {
        const column = Object.keys(filter)[0];
        const value = filter[column];
        if (column && value) {
          filterString = `${column}=eq.${value}`;
        }
      }
      
      // Create and subscribe to the channel
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table,
            filter: filterString
          },
          (payload) => {
            console.log(`${table} changed:`, payload);
            onUpdate();
          }
        )
        .subscribe();
        
      return channel;
    });
    
    // Clean up all subscriptions when component unmounts
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [tables, onUpdate, filter, enabled]);
};
