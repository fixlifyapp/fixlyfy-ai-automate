
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from './useJobs';
import { toast } from 'sonner';

interface UseJobsOptimizedOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  filters?: {
    status?: string;
    technician?: string;
    client?: string;
  };
}

// Helper function to safely convert Json to string array
const convertJsonToStringArray = (jsonValue: any): string[] => {
  if (!jsonValue) return [];
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => String(item));
  }
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue);
      return Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to transform database job to Job type
const transformDbJobToJob = (dbJob: any): Job => {
  return {
    ...dbJob,
    tasks: convertJsonToStringArray(dbJob.tasks),
    tags: dbJob.tags || [],
    // Ensure all required Job properties exist
    title: dbJob.title || '',
    client: dbJob.client || dbJob.client_id || '',
    status: dbJob.status || 'scheduled',
    date: dbJob.date || dbJob.created_at,
    revenue: dbJob.revenue || 0
  };
};

export const useJobsOptimized = (options: UseJobsOptimizedOptions = {}) => {
  const {
    page = 1,
    pageSize = 20,
    enableRealtime = false,
    filters = {}
  } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.technician) {
        query = query.eq('technician_id', filters.technician);
      }
      if (filters.client) {
        query = query.eq('client_id', filters.client);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match Job interface
      const transformedJobs = (data || []).map(transformDbJobToJob);

      setJobs(transformedJobs);
      setTotalCount(count || 0);
      setHasMore((data?.length || 0) === pageSize);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  const refreshJobs = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = useCallback(async (jobData: Partial<Job>) => {
    try {
      // Ensure required fields are present
      const jobToInsert = {
        ...jobData,
        id: jobData.id || `job-${Date.now()}`,
        title: jobData.title || '',
        status: jobData.status || 'scheduled',
        tasks: jobData.tasks || []
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobToInsert])
        .select()
        .single();

      if (error) throw error;

      const transformedJob = transformDbJobToJob(data);
      setJobs(prev => [transformedJob, ...prev]);
      toast.success('Job created successfully');
      return transformedJob;
    } catch (err: any) {
      console.error('Error creating job:', err);
      toast.error('Failed to create job');
      throw err;
    }
  }, []);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      const transformedJob = transformDbJobToJob(data);
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...transformedJob } : job
      ));
      
      return transformedJob;
    } catch (err: any) {
      console.error('Error updating job:', err);
      throw err;
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (err: any) {
      console.error('Error deleting job:', err);
      toast.error('Failed to delete job');
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Job change received:', payload);
          refreshJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, refreshJobs]);

  return {
    jobs,
    isLoading,
    error,
    hasMore,
    totalCount,
    refreshJobs,
    addJob,
    updateJob,
    deleteJob,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  };
};
