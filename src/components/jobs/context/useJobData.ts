
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobData {
  id: string;
  title: string;
  client_id: string;
  client_name?: string;
  status: string;
  description?: string;
  address?: string;
  date?: string;
  technician_id?: string;
  technician_name?: string;
  property_id?: string;
  revenue?: number;
  created_at?: string;
  updated_at?: string;
}

export const useJobData = (jobId: string) => {
  const [job, setJob] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobData = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Fetch job data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          clients!jobs_client_id_fkey(name)
        `)
        .eq('id', jobId)
        .single();

      if (jobError) {
        throw jobError;
      }

      if (jobData) {
        setJob({
          ...jobData,
          client_name: jobData.clients?.name
        });
      }

    } catch (error: any) {
      console.error('Error fetching job data:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load job data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshJobData = () => {
    fetchJobData();
  };

  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  return {
    job,
    isLoading,
    error,
    refreshJobData
  };
};
