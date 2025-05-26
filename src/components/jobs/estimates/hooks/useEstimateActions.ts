
import { useState } from 'react';
import { toast } from 'sonner';
import { Estimate } from '@/hooks/useEstimates';

export interface EstimateActionsState {
  selectedEstimate: Estimate | null;
  isDeleting: boolean;
  isConverting: boolean;
}

export interface EstimateActionsActions {
  setSelectedEstimate: (estimate: Estimate | null) => void;
  handleSendEstimate: (estimateId: string) => Promise<boolean>;
  confirmDeleteEstimate: () => Promise<boolean>;
  confirmConvertToInvoice: () => Promise<boolean>;
}

export interface EstimateActionsHook {
  state: EstimateActionsState;
  actions: EstimateActionsActions;
}

export const useEstimateActions = (
  jobId: string,
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  onEstimateConverted?: () => void
): EstimateActionsHook => {
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleSendEstimate = async (estimateId: string): Promise<boolean> => {
    try {
      // Mock implementation - in a real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update estimate status to 'sent'
      setEstimates(estimates.map(est => 
        est.id === estimateId ? { ...est, status: 'sent' } : est
      ));
      
      toast.success('Estimate sent successfully');
      return true;
    } catch (error) {
      toast.error('Failed to send estimate');
      return false;
    }
  };

  const confirmDeleteEstimate = async (): Promise<boolean> => {
    if (!selectedEstimate) return false;
    
    setIsDeleting(true);
    try {
      // Mock implementation - in a real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove estimate from list
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      
      toast.success('Estimate deleted successfully');
      setSelectedEstimate(null);
      return true;
    } catch (error) {
      toast.error('Failed to delete estimate');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmConvertToInvoice = async (): Promise<boolean> => {
    if (!selectedEstimate) return false;
    
    setIsConverting(true);
    try {
      // Mock implementation - in a real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update estimate status to 'converted'
      setEstimates(estimates.map(est => 
        est.id === selectedEstimate.id ? { ...est, status: 'converted' } : est
      ));
      
      toast.success('Estimate converted to invoice successfully');
      setSelectedEstimate(null);
      
      if (onEstimateConverted) {
        onEstimateConverted();
      }
      
      return true;
    } catch (error) {
      toast.error('Failed to convert estimate');
      return false;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    state: {
      selectedEstimate,
      isDeleting,
      isConverting
    },
    actions: {
      setSelectedEstimate,
      handleSendEstimate,
      confirmDeleteEstimate,
      confirmConvertToInvoice
    }
  };
};
