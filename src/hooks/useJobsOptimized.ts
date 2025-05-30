
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Job } from "@/hooks/useJobs";

interface UseJobsOptimizedOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
}

export const useJobsOptimized = (options: UseJobsOptimizedOptions = {}) => {
  const { page = 1, pageSize = 50, enableRealtime = true } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching jobs with optimized query...');
      
      // Optimized query - select only necessary fields initially
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          client_id,
          status,
          job_type,
          service,
          date,
          schedule_start,
          revenue,
          address,
          tags,
          created_at,
          client:clients(id, name, email, phone)
        `, { count: 'exact' });
      
      // Apply role-based filtering
      const jobViewScope = getJobViewScope();
      if (jobViewScope === "assigned" && user?.id) {
        query = query.eq('technician_id', user.id);
      } else if (jobViewScope === "none") {
        setJobs([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }
      
      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} jobs successfully`);
      
      // Process jobs efficiently
      const processedJobs = (data || []).map(job => ({
        ...job,
        tags: Array.isArray(job.tags) ? job.tags : [],
        title: job.title || `${job.client?.name || 'Service'} - ${job.job_type || job.service || 'General Service'}`
      }));
      
      setJobs(processedJobs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, getJobViewScope, user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    console.log('Setting up real-time updates for jobs...');
    
    const channel = supabase
      .channel('jobs-optimized-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Real-time job update received:', payload);
          // Immediate refresh on any job change
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time job subscription...');
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, enableRealtime]);

  // Memoized computed values
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const refreshJobs = useCallback(() => {
    console.log('Manual refresh triggered...');
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage,
    hasPreviousPage,
    refreshJobs,
    canCreate: canCreateJobs(),
    canEdit: canEditJobs(),
    canDelete: canDeleteJobs(),
    viewScope: getJobViewScope()
  };
};
