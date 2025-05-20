
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // Prepare query
        let query = supabase
          .from('jobs')
          .select('*, clients(name)');
          
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
    
    fetchJobs();
  }, [clientId, refreshTrigger]);

  const addJob = async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate a job ID in the format JOB-XXXXX
      const jobNumber = Math.floor(10000 + Math.random() * 90000);
      const jobId = `JOB-${jobNumber}`;
      
      const newJob = {
        ...job,
        id: jobId,
        // Set default values if not provided
        status: job.status || 'scheduled',
        date: job.date || new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(newJob)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add client info to the returned job
      const { data: clientData } = await supabase
        .from('clients')
        .select('name')
        .eq('id', job.client_id)
        .single();
        
      const jobWithClient = {
        ...data,
        client: {
          name: clientData?.name || 'Unknown Client'
        }
      };
      
      setJobs(prev => [jobWithClient, ...prev]);
      toast.success('Job added successfully');
      return jobWithClient;
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job');
      return null;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the jobs list
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, ...data, client: job.client } : job
      ));
      
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
      
      setJobs(prev => prev.filter(job => job.id !== id));
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
