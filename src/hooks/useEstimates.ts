
import { useState } from 'react';

// Define the Estimate type with ALL required properties
export interface Estimate {
  id: string;
  job_id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  viewed: boolean;
  discount?: number;
  tax_rate?: number;
  technicians_note?: string;
  created_at: string;
  updated_at: string;
  estimate_items?: any[];
  // Add the missing properties from the error
  items?: any[];
  recommendedProduct?: any;
  techniciansNote?: string;
}

// Now fix the useEstimates hook implementation to include all required properties and methods
export const useEstimates = (jobId: string, onEstimateConverted?: () => void) => {
  // Import the actual implementation from the components directory
  const { 
    estimates,
    isLoading,
    error,
    dialogs,
    state,
    handlers,
    info
  } = require("@/components/jobs/estimates/useEstimates").useEstimates(jobId, onEstimateConverted);
  
  return {
    estimates,
    isLoading,
    dialogs,
    state,
    handlers,
    info,
    error
  };
};
