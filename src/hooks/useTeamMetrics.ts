
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TechnicianMetric {
  id: string;
  name: string;
  job_count: number;
  total_revenue: number;
  avatar?: string;
}

export const useTeamMetrics = (dateRange?: { start: string; end: string }) => {
  const [technicians, setTechnicians] = useState<TechnicianMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all jobs with technician IDs
        let query = supabase
          .from('jobs')
          .select(`
            id,
            revenue,
            technician_id,
            profiles:technician_id (name, avatar_url)
          `);
          
        // Filter by date range if provided
        if (dateRange) {
          query = query.gte('date', dateRange.start)
            .lte('date', dateRange.end);
        }
        
        // Only include completed jobs for revenue calculations
        query = query.eq('status', 'completed');
          
        const { data: jobs, error } = await query;
        
        if (error) throw error;
        
        // Group jobs by technician and calculate metrics
        const techMetricsMap = new Map<string, TechnicianMetric>();
        
        for (const job of (jobs || [])) {
          if (job.technician_id && job.profiles) {
            const techId = job.technician_id;
            const techName = job.profiles.name || 'Unknown';
            const avatar = job.profiles.avatar_url;
            const revenue = job.revenue || 0;
            
            if (!techMetricsMap.has(techId)) {
              techMetricsMap.set(techId, {
                id: techId,
                name: techName,
                job_count: 1,
                total_revenue: revenue,
                avatar
              });
            } else {
              const current = techMetricsMap.get(techId)!;
              techMetricsMap.set(techId, {
                ...current,
                job_count: current.job_count + 1,
                total_revenue: current.total_revenue + revenue
              });
            }
          }
        }
        
        // Convert to array and sort by revenue
        const techMetricsArray = Array.from(techMetricsMap.values())
          .sort((a, b) => b.total_revenue - a.total_revenue);
        
        setTechnicians(techMetricsArray);
      } catch (error) {
        console.error("Error fetching team metrics:", error);
        setError("Failed to load team metrics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMetrics();
  }, [dateRange]);
  
  return {
    technicians,
    isLoading,
    error
  };
};
