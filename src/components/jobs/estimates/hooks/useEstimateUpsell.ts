
import { useState } from 'react';
import { UpsellItem } from '../../dialogs/shared/types';

export const useEstimateUpsell = () => {
  const [upsellItems] = useState<UpsellItem[]>([]);
  const [isLoading] = useState(false);

  const addUpsellToEstimate = async (estimateId: string, items: UpsellItem[]) => {
    // Mock implementation
    console.log('Adding upsell items to estimate:', estimateId, items);
    return true;
  };

  return {
    upsellItems,
    isLoading,
    addUpsellToEstimate
  };
};
