import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Job } from "@/hooks/useJobs";
import { localStorageCache } from "@/utils/cacheConfig";

interface UseJobsOptimizedOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  clientId?: string;
}

// Helper function to safely cast Json tasks to string array
const extractTasks = (tasks: any): string[] => {
  if (!tasks) return [];
  if (Array.isArray(tasks)) {
    return tasks.filter(task => typeof task === 'string');
  }
  if (typeof tasks === 'string') {
    try {
      const parsed = JSON.parse(tasks);
      return Array.isArray(parsed) ? parsed.filter(task => typeof task === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Request deduplication cache with longer TTL
const requestCache = new Map<string, Promise<any>>();

export const useJobsOptimized = (options: UseJobsOptimizedOptions = {}) => {
  const { page = 1, pageSize = 50, enableRealtime = true, clientId } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cache key for localStorage and request deduplication
  const cacheKey = useMemo(() => 
    `jobs_${clientId || 'all'}_${page}_${pageSize}_${user?.id}`,
    [clientId, page, pageSize, user?.id]
  );

  const fetchJobs = useCallback(async (useCache = true) => {
    // Check if request is already in flight
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

    // Try to get from localStorage cache first with longer TTL
    if (useCache) {
      const cachedJobs = localStorageCache.get(cacheKey);
      if (cachedJobs && isMountedRef.current) {
        setJobs(cachedJobs.jobs);
        setTotalCount(cachedJobs.totalCount);
        setIsLoading(false);
        return;
      }
    }

    // Create and cache the request promise
    const requestPromise = (async () => {
      setIsLoading(true);
      try {
        // Optimized query with better indexing
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
            tasks,
            created_at,
            updated_at,
            client:clients!inner(id, name, email, phone)
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
          return { jobs: [], totalCount: 0 };
        }
        
        // Apply pagination with better performance
        query = query
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Process jobs efficiently
        const dbJobs = (data || []);
        const transformedJobs = dbJobs.map(job => ({
          ...job,
          updated_at: job.updated_at || job.created_at, // Ensure updated_at is always present
          tasks: extractTasks(job.tasks), // Safely extract tasks
          client: job.clients || job.client_id || 'Unknown Client'
        }));
        
        const result = {
          jobs: transformedJobs,
          totalCount: count || 0
        };
        
        // Cache the results with longer TTL
        if (useCache) {
          localStorageCache.set(cacheKey, result, 20); // Cache for 20 minutes
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
        throw error;
      }
    })();

    // Cache the request promise
    requestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (isMountedRef.current && result) {
        setJobs(result.jobs);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      // Error already handled in the request
    } finally {
      // Keep request cache longer
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, 600000); // 10 minutes
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, clientId, getJobViewScope, user?.id, page, pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real-time updates with longer debouncing and smarter caching
  useEffect(() => {
    if (!enableRealtime) return;

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
          if (!isSubscribed) return;
          
          // Longer debounce to prevent excessive updates
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (isSubscribed && isMountedRef.current) {
              // Smart cache invalidation - only clear specific cache
              localStorageCache.remove(cacheKey);
              requestCache.delete(cacheKey);
              fetchJobs(false);
            }
          }, 2000); // 2 second debounce
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
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
    requestCache.delete(cacheKey);
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
