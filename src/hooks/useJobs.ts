
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

// Explicit database job interface
interface DatabaseJob {
  id: string;
  title: string;
  description?: string;
  status: string;
  client_id?: string;
  technician_id?: string;
  property_id?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  created_at?: string;
  updated_at?: string;
  revenue?: number;
  tags?: string[];
  notes?: string;
  job_type?: string;
  lead_source?: string;
  service?: string;
  tasks: unknown;
  created_by?: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  estimates?: Array<{
    id: string;
    total: number;
  }> | null;
  invoices?: Array<{
    id: string;
    total: number;
  }> | null;
}

// Simple task parsing function
const parseTasks = (tasks: unknown): string[] => {
  if (!tasks) return [];
  
  if (typeof tasks === 'string') {
    try {
      const parsed = JSON.parse(tasks);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  if (Array.isArray(tasks)) {
    return tasks;
  }
  
  return [];
};

// Simplified transform function with explicit typing
const transformDatabaseJob = (dbJob: DatabaseJob): Job => {
  const job: Job = {
    id: dbJob.id,
    title: dbJob.title,
    description: dbJob.description,
    status: dbJob.status,
    client_id: dbJob.client_id,
    technician_id: dbJob.technician_id,
    property_id: dbJob.property_id,
    date: dbJob.date,
    schedule_start: dbJob.schedule_start,
    schedule_end: dbJob.schedule_end,
    created_at: dbJob.created_at,
    updated_at: dbJob.updated_at,
    revenue: dbJob.revenue,
    tags: dbJob.tags,
    notes: dbJob.notes,
    job_type: dbJob.job_type,
    lead_source: dbJob.lead_source,
    service: dbJob.service,
    tasks: parseTasks(dbJob.tasks),
    created_by: dbJob.created_by,
    clients: dbJob.clients,
    estimates: dbJob.estimates,
    invoices: dbJob.invoices,
    custom_fields: []
  };

  return job;
};

export const useJobs = (clientId?: string, enableCustomFields?: boolean) => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [filters, setFilters] = useState<JobsFilter>({});

  const fetchJobs = async (): Promise<void> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`*, 
          clients ( name, id, email, phone, address ), 
          estimates ( id, total ), 
          invoices ( id, total )
        `, { count: 'exact' });

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

      const transformedJobs: Job[] = [];
      if (data) {
        for (const dbJob of data) {
          const transformedJob = transformDatabaseJob(dbJob as DatabaseJob);
          transformedJobs.push(transformedJob);
        }
      }

      setJobs(transformedJobs);
      setTotalJobs(count || 0);
    } catch (error: unknown) {
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
        return transformDatabaseJob(data as DatabaseJob);
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

  useEffect(() => {
    fetchJobs();
  }, [filters, clientId]);

  useRealtimeSync({
    tables: ['jobs', 'clients', 'estimates', 'invoices', 'client_properties'],
    onUpdate: () => {
      void fetchJobs();
    },
    enabled: true
  });

  const updateFilters = (newFilters: JobsFilter): void => {
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
