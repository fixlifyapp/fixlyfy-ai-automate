
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useJobsRealtime = (onJobChange: () => void) => {
  useEffect(() => {
    // Enable realtime subscriptions for the jobs table
    const channel = supabase
      .channel('public:jobs')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Jobs table changed:', payload);
          // Call the callback to refresh jobs data
          onJobChange();
          
          // Optionally show a toast notification for the event
          if (payload.eventType === 'INSERT') {
            toast.info('A new job was created');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('A job was updated');
          } else if (payload.eventType === 'DELETE') {
            toast.info('A job was deleted');
          }
        }
      )
      .subscribe();
      
    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onJobChange]);
};
