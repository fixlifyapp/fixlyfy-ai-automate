
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DbJob, DbClient, extractStringArray, extractClientInfo } from "@/types/database-types";

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
        const dbJob = job as DbJob & { clients?: DbClient | DbClient[] };
        const clientData = Array.isArray(dbJob.clients) ? dbJob.clients[0] : dbJob.clients;
        
        return {
          id: dbJob.id,
          client_id: dbJob.client_id || '',
          clientId: dbJob.client_id || '', // Add alias
          title: dbJob.title || '',
          description: dbJob.description || undefined,
          service: dbJob.service || undefined,
          status: dbJob.status || 'scheduled',
          tags: extractStringArray(dbJob.tags),
          notes: dbJob.notes || undefined,
          job_type: dbJob.job_type || undefined,
          lead_source: dbJob.lead_source || undefined,
          address: dbJob.address || undefined,
          date: dbJob.date || undefined,
          schedule_start: dbJob.schedule_start || undefined,
          schedule_end: dbJob.schedule_end || undefined,
          revenue: dbJob.revenue || undefined,
          technician_id: dbJob.technician_id || undefined,
          created_by: dbJob.created_by || undefined,
          created_at: dbJob.created_at,
          updated_at: dbJob.updated_at || dbJob.created_at,
          tasks: extractStringArray(dbJob.tasks),
          property_id: dbJob.property_id || undefined,
          client: clientData?.name || dbJob.client_id || '',
          phone: clientData?.phone || '',
          email: clientData?.email || '',
          total: dbJob.revenue || 0
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

  const addJob = async (jobData: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      const newJob = {
        ...data,
        clientId: data.client_id,
        tasks: extractStringArray(data.tasks),
        total: data.revenue || 0
      } as Job;

      setJobs(prev => [newJob, ...prev]);
      return newJob;
    } catch (error: any) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job');
      throw error;
    }
  };

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

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== jobId));
      return true;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return false;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    setJobs,
    isLoading,
    refreshJobs: fetchJobs,
    addJob,
    updateJob,
    deleteJob
  };
};
