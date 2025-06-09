
import { useState } from 'react';

export const useJobFinancials = (jobId: string) => {
  const [financials] = useState({
    totalEstimates: 0,
    totalInvoices: 0,
    totalPaid: 0,
    totalOutstanding: 0
  });
  const [isLoading] = useState(false);

  return {
    financials,
    isLoading,
    error: null
  };
};
