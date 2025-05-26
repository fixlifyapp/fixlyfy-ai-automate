
import { useState } from 'react';
import { toast } from 'sonner';

export interface EstimateActionsHook {
  isLoading: boolean;
  sendEstimate: (estimateId: string) => Promise<boolean>;
  deleteEstimate: (estimateId: string) => Promise<boolean>;
  duplicateEstimate: (estimateId: string) => Promise<boolean>;
}

export const useEstimateActions = (): EstimateActionsHook => {
  const [isLoading, setIsLoading] = useState(false);

  const sendEstimate = async (estimateId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock implementation - in a real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Estimate sent successfully');
      return true;
    } catch (error) {
      toast.error('Failed to send estimate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEstimate = async (estimateId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock implementation - in a real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Estimate deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete estimate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateEstimate = async (estimateId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock implementation - in a real app this would call the API
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Estimate duplicated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to duplicate estimate');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendEstimate,
    deleteEstimate,
    duplicateEstimate
  };
};
