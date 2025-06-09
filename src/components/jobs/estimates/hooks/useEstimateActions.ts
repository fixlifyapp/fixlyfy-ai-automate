
import { useState } from 'react';
import { Estimate } from '@/hooks/useEstimates';

export interface UseEstimateActionsReturn {
  state: {
    isSending: boolean;
    isDeleting: boolean;
    isConverting: boolean;
  };
  actions: {
    setSelectedEstimate: (estimate: Estimate | null) => void;
    confirmDeleteEstimate: () => Promise<void>;
    confirmConvertToInvoice: () => Promise<void>;
  };
}

export const useEstimateActions = (
  jobId: string,
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  refreshEstimates: () => void,
  onEstimateConverted?: () => void
): UseEstimateActionsReturn => {
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

  const confirmDeleteEstimate = async () => {
    if (!selectedEstimate) return;
    
    setIsDeleting(true);
    try {
      // Mock delete operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      refreshEstimates();
    } finally {
      setIsDeleting(false);
      setSelectedEstimate(null);
    }
  };

  const confirmConvertToInvoice = async () => {
    if (!selectedEstimate) return;
    
    setIsConverting(true);
    try {
      // Mock convert operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      onEstimateConverted?.();
    } finally {
      setIsConverting(false);
      setSelectedEstimate(null);
    }
  };

  return {
    state: {
      isSending,
      isDeleting,
      isConverting
    },
    actions: {
      setSelectedEstimate,
      confirmDeleteEstimate,
      confirmConvertToInvoice
    }
  };
};
