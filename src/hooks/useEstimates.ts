
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Estimate {
  id: string;
  job_id: string;
  estimate_number: string;
  date: string;
  status: string;
  total: number;
  notes?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
}

export const useEstimates = (jobId: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEstimates = async () => {
    if (!jobId) return;
    
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstimates(data || []);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [jobId]);

  return {
    estimates,
    setEstimates,
    isLoading,
    refreshEstimates: fetchEstimates
  };
};
