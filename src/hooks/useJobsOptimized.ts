
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Job } from "@/hooks/useJobs";
import { localStorageCache } from "@/utils/cacheConfig";
import { withRetry, handleJobsError } from "@/utils/errorHandling";

interface UseJobsOptimizedOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  clientId?: string;
}

interface JobsResult {
  jobs: Job[];
  totalCount: number;
}

const requestCache = new Map<string, Promise<JobsResult>>();

export const useJobsOptimized = (options: UseJobsOptimizedOptions = {}) => {
  const { page = 1, pageSize = 50, enableRealtime = true, clientId } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cacheKey = useMemo(() => 
    `jobs_${clientId || 'all'}_${page}_${pageSize}_${user?.id}`,
    [clientId, page, pageSize, user?.id]
  );

  const fetchJobs = useCallback(async (useCache = true) => {
    if (hasError || !user?.id) return;

    if (requestCache.has(cacheKey)) {
      try {
        const cachedRequest = await requestCache.get(cacheKey);
        if (isMountedRef.current && cachedRequest) {
          setJobs(cachedRequest.jobs);
          setTotalCount(cachedRequest.totalCount);
          setIsLoading(false);
        }
        return;
      } catch (error) {
        // Continue with fresh request if cached request failed
      }
    }

    if (useCache) {
      const cachedJobs = localStorageCache.get<JobsResult>(cacheKey);
      if (cachedJobs && isMountedRef.current) {
        setJobs(cachedJobs.jobs);
        setTotalCount(cachedJobs.totalCount);
        setIsLoading(false);
        return;
      }
    }

    const requestPromise = (async (): Promise<JobsResult> => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        return await withRetry(async () => {
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
              client:clients!inner(id, name, email, phone)
            `, { count: 'exact' });
          
          if (clientId) {
            query = query.eq('client_id', clientId);
          }
          
          const jobViewScope = getJobViewScope();
          if (jobViewScope === "assigned" && user?.id) {
            query = query.eq('technician_id', user.id);
          } else if (jobViewScope === "none") {
            return { jobs: [], totalCount: 0 };
          }
          
          query = query
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);
          
          const { data, error, count } = await query;
          
          if (error) throw error;
          
          const processedJobs = (data || []).map(job => ({
            ...job,
            tags: Array.isArray(job.tags) ? job.tags : [],
            title: job.title || `${job.client?.name || 'Service'} - ${job.job_type || job.service || 'General Service'}`
          }));
          
          const result: JobsResult = {
            jobs: processedJobs,
            totalCount: count || 0
          };
          
          if (useCache) {
            localStorageCache.set(cacheKey, result, 20);
          }
          
          return result;
        }, {
          maxRetries: 2,
          baseDelay: 2000
        });
      } catch (error) {
        setHasError(true);
        handleJobsError(error, 'useJobsOptimized - fetchJobs');
        throw error;
      }
    })();

    requestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (isMountedRef.current && result) {
        setJobs(result.jobs);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      // Error already handled
    } finally {
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, 600000);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, clientId, getJobViewScope, user?.id, page, pageSize, hasError]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real-time updates with error handling
  useEffect(() => {
    if (!enableRealtime || hasError) return;

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true;
    
    const channel = supabase
      .channel(`jobs-optimized-realtime-${cacheKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          if (!isSubscribed || hasError) return;
          
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (isSubscribed && isMountedRef.current && !hasError) {
              localStorageCache.remove(cacheKey);
              requestCache.delete(cacheKey);
              fetchJobs(false);
            }
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, enableRealtime, cacheKey, hasError]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const refreshJobs = useCallback(() => {
    setHasError(false);
    localStorageCache.remove(cacheKey);
    requestCache.delete(cacheKey);
    fetchJobs(false);
  }, [fetchJobs, cacheKey]);

  const clearError = useCallback(() => {
    setHasError(false);
    refreshJobs();
  }, [refreshJobs]);

  return {
    jobs,
    isLoading,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage,
    hasPreviousPage,
    hasError,
    refreshJobs,
    clearError,
    canCreate: canCreateJobs(),
    canEdit: canEditJobs(),
    canDelete: canDeleteJobs(),
    viewScope: getJobViewScope()
  };
};
