
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

export const useJobsActions = (fetchJobs: () => Promise<void>, transformDatabaseJob: (dbJob: any) => Job) => {
  const { toast } = useToast();

  const addJob = async (jobData: Partial<Job>): Promise<Job | undefined> => {
    try {
      const jobToInsert = {
        id: jobData.id || `JOB-${Date.now()}`,
        title: jobData.title || 'New Job',
        description: jobData.description,
        status: jobData.status || 'scheduled',
        client_id: jobData.client_id,
        technician_id: jobData.technician_id,
        property_id: jobData.property_id,
        date: jobData.date,
        schedule_start: jobData.schedule_start,
        schedule_end: jobData.schedule_end,
        revenue: jobData.revenue || 0,
        tags: jobData.tags || [],
        notes: jobData.notes,
        job_type: jobData.job_type,
        lead_source: jobData.lead_source,
        service: jobData.service,
        tasks: JSON.stringify(jobData.tasks || []),
        created_by: jobData.created_by
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job created successfully"
      });

      await fetchJobs();
      
      if (data) {
        return transformDatabaseJob(data);
      }
    } catch (error: unknown) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>): Promise<unknown> => {
    try {
      const updateData = {
        ...updates,
        tasks: updates.tasks ? JSON.stringify(updates.tasks) : undefined
      };

      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      await fetchJobs();
      return data;
    } catch (error: unknown) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully"
      });

      await fetchJobs();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    addJob,
    updateJob,
    deleteJob
  };
};
