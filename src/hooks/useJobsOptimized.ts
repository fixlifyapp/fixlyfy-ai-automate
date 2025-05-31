
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Job } from "@/hooks/useJobs";
import { cacheConfig, localStorageCache } from "@/utils/cacheConfig";

interface UseJobsOptimizedOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  clientId?: string;
}

export const useJobsOptimized = (options: UseJobsOptimizedOptions = {}) => {
  const { page = 1, pageSize = 50, enableRealtime = true, clientId } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();

  // Cache key for localStorage
  const cacheKey = useMemo(() => 
    `jobs_${clientId || 'all'}_${page}_${pageSize}_${user?.id}`,
    [clientId, page, pageSize, user?.id]
  );

  const fetchJobs = useCallback(async (useCache = true) => {
    // Try to get from cache first
    if (useCache) {
      const cachedJobs = localStorageCache.get(cacheKey);
      if (cachedJobs) {
        setJobs(cachedJobs.jobs);
        setTotalCount(cachedJobs.totalCount);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Optimized query - select only necessary fields
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
      
      // Apply client filter if specified
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
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
      
      // Cache the results
      if (useCache) {
        localStorageCache.set(cacheKey, {
          jobs: processedJobs,
          totalCount: count || 0
        }, 5); // Cache for 5 minutes
      }
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, clientId, getJobViewScope, user?.id, page, pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real-time updates with debouncing
  useEffect(() => {
    if (!enableRealtime) return;

    let debounceTimer: NodeJS.Timeout;
    
    const channel = supabase
      .channel('jobs-optimized-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          // Debounce real-time updates to prevent flickering
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            // Clear cache and refresh
            localStorageCache.remove(cacheKey);
            fetchJobs(false);
          }, 500); // 500ms debounce
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, enableRealtime, cacheKey]);

  // Memoized computed values
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const refreshJobs = useCallback(() => {
    localStorageCache.remove(cacheKey);
    fetchJobs(false);
  }, [fetchJobs, cacheKey]);

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
