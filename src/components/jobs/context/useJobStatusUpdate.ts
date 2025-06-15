
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { recordStatusChange } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";

export const useJobStatusUpdate = (jobId: string, onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { currentUser } = useRBAC();

  const updateJobStatus = async (newStatus: string) => {
    if (!jobId || isUpdating) return;

    setIsUpdating(true);
    
    try {
      // Get current status first
      const { data: currentJob, error: fetchError } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;

      const oldStatus = currentJob?.status;

      // Update the job status
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      // Log the status change to job history
      if (oldStatus && oldStatus !== newStatus) {
        await recordStatusChange(
          jobId,
          oldStatus,
          newStatus,
          currentUser?.name || 'Unknown User',
          currentUser?.id
        );
      }

      toast.success(`Job status updated to ${newStatus}`);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateJobStatus,
    isUpdating
  };
};
