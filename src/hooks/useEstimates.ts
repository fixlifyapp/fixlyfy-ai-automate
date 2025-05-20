
import { useState } from 'react';

// Define a simple Estimate interface that aligns with the one in useEstimateData
export interface Estimate {
  id: string;
  job_id: string;
  number?: string;
  estimate_number: string;
  date: string;
  amount?: number;
  total: number;
  status: string;
  viewed?: boolean;
  items?: any[];
  recommendedProduct?: any;
  techniciansNote?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
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
