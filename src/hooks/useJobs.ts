
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { recordStatusChange } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

export interface Job {
  id: string;
  title: string;
  description?: string;
  service?: string;
  status: string;
  client_id: string;
  client?: {
    name: string;
  };
  technician_id?: string;
  schedule_start?: string;
  schedule_end?: string;
  date: string;
  revenue?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export const useJobs = (clientId?: string) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentUser } = useRBAC();
  
  // Function to fetch jobs from Supabase
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // Prepare query
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          service,
          status,
          client_id,
          technician_id,
          schedule_start,
          schedule_end,
          date,
          revenue,
          tags,
          created_at,
          updated_at,
          clients(name)
        `);
        
      // Filter by client if provided
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      // Execute query
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include client name
      const transformedJobs = data.map(job => ({
        ...job,
        client: {
          name: job.clients?.name || 'Unknown Client'
        }
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up unified realtime sync
  useUnifiedRealtime({
    tables: ['jobs', 'clients'],
    onUpdate: fetchJobs,
    enabled: true
  });
  
  // Set up initial data fetch and refresh on dependency changes
  useEffect(() => {
    fetchJobs();
  }, [clientId, refreshTrigger]);
  
  const addJob = async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate a job ID in the format JOB-XXXXX
      const jobNumber = Math.floor(10000 + Math.random() * 90000);
      const jobId = `JOB-${jobNumber}`;
      
      // Validate required fields
      if (!job.title || !job.client_id) {
        throw new Error('Title and client are required');
      }
      
      const newJob = {
        ...job,
        id: jobId,
        // Set default values if not provided
        status: job.status || 'scheduled',
        date: job.date || new Date().toISOString(),
        service: job.service || 'General Service',
        revenue: job.revenue || 0,
        tags: job.tags || []
      };
      
      console.log('Creating job with data:', newJob);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(newJob)
        .select(`
          id,
          title,
          description,
          service,
          status,
          client_id,
          technician_id,
          schedule_start,
          schedule_end,
          date,
          revenue,
          tags,
          created_at,
          updated_at,
          clients(name)
        `)
        .single();
        
      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }
      
      // Transform the returned data
      const jobWithClient = {
        ...data,
        client: {
          name: data.clients?.name || 'Unknown Client'
        }
      };
      
      // Record job creation in history
      await recordStatusChange(
        jobId,
        'new',
        'scheduled',
        currentUser?.name,
        currentUser?.id
      );
      
      toast.success(`Job ${jobId} created successfully`);
      return jobWithClient;
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to create job: ' + (error as Error).message);
      return null;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      // If status is being updated, record it in history
      if (updates.status) {
        const job = jobs.find(j => j.id === id);
        if (job && job.status !== updates.status) {
          await recordStatusChange(
            id,
            job.status,
            updates.status,
            currentUser?.name,
            currentUser?.id
          );
        }
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select(`
          id,
          title,
          description,
          service,
          status,
          client_id,
          technician_id,
          schedule_start,
          schedule_end,
          date,
          revenue,
          tags,
          created_at,
          updated_at,
          clients(name)
        `)
        .single();
        
      if (error) throw error;
      
      toast.success('Job updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      return null;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Job deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return false;
    }
  };

  return {
    jobs,
    isLoading,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs: () => setRefreshTrigger(prev => prev + 1)
  };
};
