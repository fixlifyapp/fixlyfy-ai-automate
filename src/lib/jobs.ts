
import { supabase } from "@/integrations/supabase/client";

export const deleteJob = async (jobId: string): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to delete job: ${error.message}`);
  }
};

export const updateJobStatus = async (jobId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to update job status: ${error.message}`);
  }
};

export const assignTechnician = async (jobId: string, technicianId: string): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .update({ technician_id: technicianId })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to assign technician: ${error.message}`);
  }
};
