
import { useState } from 'react';

export interface Estimate {
  id: string;
  estimate_number: string;
  job_id: string;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useEstimates = (jobId?: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading] = useState(false);

  const refreshEstimates = () => Promise.resolve();

  return {
    estimates,
    setEstimates,
    isLoading,
    error: null,
    refetch: refreshEstimates,
    refreshEstimates
  };
};
