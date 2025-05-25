
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

interface JobsFilter {
  status?: string;
  priority?: string;
  query?: string;
  clientId?: string;
  propertyId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

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
  tasks: any;
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

const parseTasks = (tasks: any): string[] => {
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

const transformDatabaseJob = (dbJob: DatabaseJob): Job => {
  return {
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
};

interface UseJobsDataReturn {
  jobs: Job[];
  isLoading: boolean;
  totalJobs: number;
  filters: JobsFilter;
  updateFilters: (newFilters: JobsFilter) => void;
  fetchJobs: () => Promise<void>;
  transformDatabaseJob: (dbJob: DatabaseJob) => Job;
}

export const useJobsData = (clientId?: string): UseJobsDataReturn => {
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
    fetchJobs,
    transformDatabaseJob
  };
};
