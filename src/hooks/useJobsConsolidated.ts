
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DbJob } from "@/types/database-types";
import { useClients } from "./useClients";

export interface Job {
  id: string;
  client_id: string | null;
  title?: string | null;
  description?: string | null;
  service?: string | null;
  status?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  job_type?: string | null;
  lead_source?: string | null;
  address?: string | null;
  date?: string | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  revenue?: number | null;
  technician_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  tasks?: string[] | null;
  property_id?: string | null;
  client: string | {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
}

interface UseJobsResult {
  jobs: Job[];
  loading: boolean;
  error: Error | null;
  refreshJobs: () => Promise<void>;
  addJob: (newJob: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<Job | null>;
  updateJob: (id: string, updates: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>) => Promise<Job | null>;
  deleteJob: (id: string) => Promise<boolean>;
}

// Helper function to safely cast Json tasks to string array
const extractTasks = (tasks: any): string[] => {
  if (!tasks) return [];
  if (Array.isArray(tasks)) {
    return tasks.filter(task => typeof task === 'string');
  }
  if (typeof tasks === 'string') {
    try {
      const parsed = JSON.parse(tasks);
      return Array.isArray(parsed) ? parsed.filter(task => typeof task === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const useJobsConsolidated = (): UseJobsResult => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { clients } = useClients();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: dbJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) {
        setError(jobsError);
        console.error("Supabase jobs error:", jobsError);
        return;
      }

      if (dbJobs) {
        // Fetch clients along with jobs
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');

        if (clientsError) {
          setError(clientsError);
          console.error("Supabase clients error:", clientsError);
          return;
        }

        // Create a map of clients for easy lookup
        const clientsMap = new Map(clientsData?.map(client => [client.id, client]));

        // Map database jobs to the Job interface
        const transformedJobs: Job[] = dbJobs.map(job => {
          const client = clientsMap.get(job.client_id || '') || job.client_id || 'Unknown Client';
          return {
            ...job,
            updated_at: job.updated_at || job.created_at, // Ensure updated_at is always present
            tasks: extractTasks(job.tasks), // Safely extract tasks
            client: typeof client === 'object' && client !== null ? {
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone
            } : client
          };
        });

        setJobs(transformedJobs);
      }
    } catch (err: any) {
      setError(err);
      console.error("General error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [setJobs, setError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refreshJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const addJob = useCallback(async (newJob: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job | null> => {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', newJob.client_id)
        .single();

      // Prepare job data for insertion, excluding client field
      const { client, ...jobDataForDb } = newJob;
      
      const { data: dbJob, error: jobsError } = await supabase
        .from('jobs')
        .insert([jobDataForDb])
        .select()
        .single();

      if (jobsError) {
        setError(jobsError);
        console.error("Supabase add job error:", jobsError);
        toast.error('Failed to add job.');
        return null;
      }

      if (dbJob) {
        const clientInfo = clientData || newJob.client_id || 'Unknown Client';
        const transformedJob: Job = {
          ...dbJob,
          updated_at: dbJob.updated_at || dbJob.created_at,
          tasks: extractTasks(dbJob.tasks),
          client: typeof clientInfo === 'object' && clientInfo !== null ? {
            id: clientInfo.id,
            name: clientInfo.name,
            email: clientInfo.email,
            phone: clientInfo.phone
          } : clientInfo
        };

        setJobs(prevJobs => [...prevJobs, transformedJob]);
        toast.success('Job added successfully!');
        return transformedJob;
      } else {
        toast.error('Failed to add job: No data returned.');
        return null;
      }
    } catch (err: any) {
      setError(err);
      console.error("Error adding job:", err);
      toast.error('Failed to add job: ' + err.message);
      return null;
    }
  }, []);

  const updateJob = useCallback(async (id: string, updates: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>): Promise<Job | null> => {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', updates.client_id)
        .single();

      // Prepare updates for database, excluding client field
      const { client, ...updatesForDb } = updates;

      const { data: dbJob, error: jobsError } = await supabase
        .from('jobs')
        .update(updatesForDb)
        .eq('id', id)
        .select()
        .single();

      if (jobsError) {
        setError(jobsError);
        console.error("Supabase update job error:", jobsError);
        toast.error('Failed to update job.');
        return null;
      }

      if (dbJob) {
        const clientInfo = clientData || updates.client_id || 'Unknown Client';
          
        const transformedJob: Job = {
          ...dbJob,
          updated_at: dbJob.updated_at || dbJob.created_at,
          tasks: extractTasks(dbJob.tasks),
          client: typeof clientInfo === 'object' && clientInfo !== null ? {
            id: clientInfo.id,
            name: clientInfo.name,
            email: clientInfo.email,
            phone: clientInfo.phone
          } : clientInfo
        };

        setJobs(prevJobs =>
          prevJobs.map(job => (job.id === id ? transformedJob : job))
        );
        toast.success('Job updated successfully!');
        return transformedJob;
      } else {
        toast.error('Failed to update job: No data returned.');
        return null;
      }
    } catch (err: any) {
      setError(err);
      console.error("Error updating job:", err);
      toast.error('Failed to update job: ' + err.message);
      return null;
    }
  }, []);

  const deleteJob = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: jobsError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (jobsError) {
        setError(jobsError);
        console.error("Supabase delete job error:", jobsError);
        toast.error('Failed to delete job.');
        return false;
      }

      setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
      toast.success('Job deleted successfully!');
      return true;
    } catch (err: any) {
      setError(err);
      console.error("Error deleting job:", err);
      toast.error('Failed to delete job: ' + err.message);
      return false;
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    refreshJobs,
    addJob,
    updateJob,
    deleteJob
  };
};
