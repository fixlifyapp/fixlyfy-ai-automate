
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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();

  // Cache duration: 30 seconds
  const CACHE_DURATION = 30000;

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < CACHE_DURATION && jobs.length > 0) {
      return; // Use cached data
    }

    setIsLoading(true);
    try {
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
      
      if (error) throw error;
      
      // Process jobs efficiently
      const processedJobs = (data || []).map(job => ({
        ...job,
        tags: Array.isArray(job.tags) ? job.tags : [],
        title: job.title || `${job.client?.name || 'Service'} - ${job.job_type || job.service || 'General Service'}`
      }));
      
      setJobs(processedJobs);
      setTotalCount(count || 0);
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, getJobViewScope, user?.id, lastFetchTime, jobs.length]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [page, pageSize]);

  // Optimized real-time updates (debounced)
  useEffect(() => {
    if (!enableRealtime) return;

    let timeoutId: NodeJS.Timeout;
    
    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          // Debounce updates to prevent too frequent refreshes
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            fetchJobs(true);
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, enableRealtime]);

  // Memoized computed values
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const refreshJobs = useCallback(() => {
    fetchJobs(true);
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
