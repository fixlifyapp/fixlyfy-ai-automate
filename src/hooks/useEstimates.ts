
import { useState } from 'react';

export interface Estimate {
  id: string;
  job_id: string;
  estimate_number: string;
  number: string;
  date: string;
  status: string;
  total: number;
  amount: number;
  notes: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

export const useEstimates = (jobId: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const convertEstimateToInvoice = async (estimateId: string) => {
    console.log('Convert estimate to invoice - to be implemented');
    return false;
  };

  const refreshEstimates = () => {
    console.log('Refresh estimates - to be implemented');
  };

  return {
    estimates,
    setEstimates,
    isLoading,
    loading: isLoading,
    convertEstimateToInvoice,
    refreshEstimates,
    refetch: refreshEstimates
  };
};
