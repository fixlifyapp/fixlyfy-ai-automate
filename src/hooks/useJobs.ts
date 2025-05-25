
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface JobsFilter {
  status?: string;
  priority?: string;
  query?: string;
  clientId?: string;
  propertyId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const useJobs = (clientId?: string, enableCustomFields?: boolean) => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [filters, setFilters] = useState<JobsFilter>({});

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`*, 
          clients ( name, id ), 
          estimates ( id, total ), 
          invoices ( id, total )
        `, { count: 'exact' });

      // Apply client filter if provided
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }

      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate.toISOString());
        query = query.lte('date', filters.endDate.toISOString());
      } else if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      } else if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }

      if (filters.query) {
        const searchQuery = `%${filters.query}%`;
        query = query.ilike('title', searchQuery);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setJobs(data || []);
      setTotalJobs(count || 0);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
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

      toast({
        title: "Success",
        description: "Job created successfully"
      });

      await fetchJobs();
      return data;
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      await fetchJobs();
      return data;
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteJob = async (jobId: string) => {
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
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters, clientId]);

  // Set up real-time updates
  useRealtimeSync({
    tables: ['jobs', 'clients', 'estimates', 'invoices', 'client_properties'],
    onUpdate: fetchJobs,
    enabled: true
  });

  const updateFilters = (newFilters: JobsFilter) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return {
    jobs,
    isLoading,
    totalJobs,
    filters,
    updateFilters,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs: fetchJobs
  };
};

export type { Job };
