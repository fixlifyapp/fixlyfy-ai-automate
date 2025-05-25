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

export const useJobs = () => {
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
          estimates ( id, total_amount ), 
          invoices ( id, total_amount )
        `, { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }

      if (filters.startDate && filters.endDate) {
        query = query.gte('start_date', filters.startDate.toISOString());
        query = query.lte('start_date', filters.endDate.toISOString());
      } else if (filters.startDate) {
        query = query.gte('start_date', filters.startDate.toISOString());
      } else if (filters.endDate) {
        query = query.lte('start_date', filters.endDate.toISOString());
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

  useEffect(() => {
    fetchJobs();
  }, [filters]);

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
    refreshJobs: fetchJobs
  };
};
