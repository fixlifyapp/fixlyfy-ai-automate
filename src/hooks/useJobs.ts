import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Job {
  id: string;
  client_id: string;
  clientId?: string; // Add alias for backward compatibility
  title: string;
  description?: string;
  service?: string;
  status: string;
  tags?: string[];
  notes?: string;
  job_type?: string;
  lead_source?: string;
  address?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  revenue?: number;
  technician_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tasks?: string[];
  property_id?: string;
  
  // Client information (from join)
  client?: string | { 
    id: string; 
    name: string; 
    email?: string; 
    phone?: string; 
    address?: string; 
    city?: string; 
    state?: string; 
    zip?: string; 
  };
  phone?: string;
  email?: string;
  
  // Additional calculated fields
  total?: number;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients:client_id (
            id,
            name,
            email,
            phone,
            address,
            city,
            state,
            zip
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      // Transform the data to include flattened client info and aliases
      const transformedJobs: Job[] = (data || []).map(job => {
        const clientData = Array.isArray(job.clients) ? job.clients[0] : job.clients;
        
        return {
          ...job,
          clientId: job.client_id, // Add alias
          client: clientData?.name || job.client_id,
          phone: clientData?.phone || '',
          email: clientData?.email || '',
          tasks: Array.isArray(job.tasks) ? job.tasks : [],
          total: job.revenue || 0
        };
      });

      setJobs(transformedJobs);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

      if (error) throw error;

      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, ...updates } : job
        )
      );

      return true;
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      return false;
    }
  };

  return {
    jobs,
    setJobs,
    isLoading,
    refreshJobs: fetchJobs,
    updateJob
  };
};
