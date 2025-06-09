
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientAnalytics {
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageJobValue: number;
  recentJobs: any[];
  estimates: any[];
  invoices: any[];
}

export const useClientAnalytics = (clientId?: string) => {
  const [analytics, setAnalytics] = useState<ClientAnalytics>({
    totalJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    averageJobValue: 0,
    recentJobs: [],
    estimates: [],
    invoices: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!clientId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch jobs for this client
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientId);

      if (jobsError) throw jobsError;

      // Fetch estimates for this client
      const { data: estimates, error: estimatesError } = await supabase
        .from('estimates')
        .select('*')
        .eq('client_id', clientId);

      if (estimatesError) throw estimatesError;

      // Fetch invoices for this client
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId);

      if (invoicesError) throw invoicesError;

      // Calculate analytics
      const totalJobs = jobs?.length || 0;
      const completedJobs = jobs?.filter(job => job.status === 'completed').length || 0;
      const totalRevenue = jobs?.reduce((sum, job) => sum + (job.revenue || 0), 0) || 0;
      const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

      setAnalytics({
        totalJobs,
        completedJobs,
        totalRevenue,
        averageJobValue,
        recentJobs: jobs?.slice(0, 5) || [],
        estimates: estimates || [],
        invoices: invoices || []
      });

    } catch (err) {
      console.error('Error fetching client analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [clientId]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};
