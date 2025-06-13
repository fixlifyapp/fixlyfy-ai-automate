
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useJobStatusUpdate = (jobId: string, refreshJob: () => void) => {
  const updateJobStatus = async (newStatus: string) => {
    if (!jobId) return;
    
    try {
      console.log('Updating job status:', { jobId, newStatus });
      
      // Update job status in database
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
        
      if (error) {
        console.error("Error updating job status:", error);
        toast.error("Failed to update job status");
        return;
      }
      
      toast.success(`Job status updated to ${newStatus}`);
      
      // Refresh job data
      refreshJob();
      
    } catch (error) {
      console.error("Error in updateJobStatus:", error);
      toast.error("Failed to update job status");
    }
  };

  return { updateJobStatus };
};
