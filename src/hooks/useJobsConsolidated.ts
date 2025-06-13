
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Job } from "@/hooks/useJobs";

interface UseJobsOptions {
  page?: number;
  pageSize?: number;
  enableRealtime?: boolean;
  clientId?: string;
  filters?: {
    search?: string;
    status?: string;
    type?: string;
    technician?: string;
    dateRange?: { start: Date | null; end: Date | null };
    tags?: string[];
  };
}

// Enhanced cache with longer TTL and better cleanup
const jobsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const useJobsConsolidated = (options: UseJobsOptions = {}) => {
  const { 
    page = 1, 
    pageSize = 50, 
    enableRealtime = true, 
    clientId,
    filters = {}
  } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cacheKey = useMemo(() => {
    const filterKey = JSON.stringify(filters);
    return `jobs_${clientId || 'all'}_${page}_${pageSize}_${user?.id}_${filterKey}`;
  }, [clientId, page, pageSize, user?.id, filters]);

  const fetchJobs = useCallback(async (useCache = true) => {
    // Check cache first
    if (useCache) {
      const cached = jobsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        if (isMountedRef.current) {
          setJobs(cached.data.jobs);
          setTotalCount(cached.data.totalCount);
          setIsLoading(false);
        }
        return;
      }
    }

    setIsLoading(true);
    try {
      // Build optimized query with server-side filtering
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
      
      // Apply filters at database level for better performance
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      if (filters.status && filters.status !== "all") {
        query = query.eq('status', filters.status);
      }
      
      if (filters.type && filters.type !== "all") {
        query = query.eq('job_type', filters.type);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,clients.name.ilike.%${filters.search}%`);
      }
      
      // Apply role-based filtering
      const jobViewScope = getJobViewScope();
      if (jobViewScope === "assigned" && user?.id) {
        query = query.eq('technician_id', user.id);
      } else if (jobViewScope === "none") {
        if (isMountedRef.current) {
          setJobs([]);
          setTotalCount(0);
          setIsLoading(false);
        }
        return;
      }
      
      // Apply pagination
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
      
      const result = {
        jobs: processedJobs,
        totalCount: count || 0
      };
      
      // Cache with 20-minute TTL
      jobsCache.set(cacheKey, { 
        data: result, 
        timestamp: Date.now(), 
        ttl: 20 * 60 * 1000 
      });
      
      if (isMountedRef.current) {
        setJobs(result.jobs);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      if (isMountedRef.current) {
        toast.error('Failed to load jobs');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, clientId, getJobViewScope, user?.id, page, pageSize, filters]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Optimized real-time updates with longer debouncing
  useEffect(() => {
    if (!enableRealtime) return;

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true;
    
    const channel = supabase
      .channel(`jobs-realtime-${cacheKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          if (!isSubscribed) return;
          
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (isSubscribed && isMountedRef.current) {
              jobsCache.delete(cacheKey);
              fetchJobs(false);
            }
          }, 3000); // 3 second debounce
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, enableRealtime, cacheKey]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  const refreshJobs = useCallback(() => {
    jobsCache.delete(cacheKey);
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

// Cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of jobsCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        jobsCache.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Clean every 5 minutes
}
