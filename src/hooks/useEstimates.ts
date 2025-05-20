
import { useState } from 'react';

// Define a simple Estimate interface for future implementation
export interface Estimate {
  id: string;
  job_id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
}

// Simplified placeholder version of useEstimates
export const useEstimates = (jobId: string, onEstimateConverted?: () => void) => {
  const [estimates] = useState<Estimate[]>([]);
  const [isLoading] = useState(false);
  
  return {
    estimates,
    isLoading,
    error: false
  };
};
