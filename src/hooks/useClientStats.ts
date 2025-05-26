
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientStats {
  totalJobs: number;
  totalRevenue: number;
  lastServiceDate?: string;
  averageJobValue: number;
  jobsThisYear: number;
  revenueThisYear: number;
}

export const useClientStats = (clientId?: string) => {
  const [stats, setStats] = useState<ClientStats>({
    totalJobs: 0,
    totalRevenue: 0,
    averageJobValue: 0,
    jobsThisYear: 0,
    revenueThisYear: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    const fetchClientStats = async () => {
      setIsLoading(true);
      try {
        // Get all jobs for this client
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, revenue, date, created_at')
          .eq('client_id', clientId);

        if (error) throw error;

        const currentYear = new Date().getFullYear();
        const totalJobs = jobs?.length || 0;
        const totalRevenue = jobs?.reduce((sum, job) => sum + (job.revenue || 0), 0) || 0;
        
        // Jobs and revenue this year
        const jobsThisYear = jobs?.filter(job => {
          const jobYear = new Date(job.date || job.created_at).getFullYear();
          return jobYear === currentYear;
        }).length || 0;

        const revenueThisYear = jobs?.filter(job => {
          const jobYear = new Date(job.date || job.created_at).getFullYear();
          return jobYear === currentYear;
        }).reduce((sum, job) => sum + (job.revenue || 0), 0) || 0;

        // Last service date
        const lastServiceDate = jobs?.length > 0 
          ? jobs.sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())[0]?.date
          : undefined;

        // Average job value
        const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

        setStats({
          totalJobs,
          totalRevenue,
          lastServiceDate,
          averageJobValue,
          jobsThisYear,
          revenueThisYear
        });
      } catch (error) {
        console.error('Error fetching client stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientStats();
  }, [clientId]);

  return { stats, isLoading };
};
