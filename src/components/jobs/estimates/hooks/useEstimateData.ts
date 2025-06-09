
import { useState, useEffect } from 'react';
import { Estimate } from '@/hooks/useEstimates';

export interface EstimateDataHook {
  estimate: Estimate | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Re-export Estimate type for convenience
export type { Estimate };

export const useEstimateData = (estimateId?: string): EstimateDataHook => {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!estimateId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data for now - in a real app this would fetch from the API
      const mockEstimate: Estimate = {
        id: estimateId,
        job_id: 'mock-job',
        estimate_number: 'EST-001',
        number: 'EST-001',
        date: new Date().toISOString(),
        status: 'draft',
        total: 0,
        amount: 0,
        notes: '',
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setEstimate(mockEstimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch estimate');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [estimateId]);

  return {
    estimate,
    isLoading,
    error,
    refetch
  };
};
