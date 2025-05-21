
import { useState } from 'react';

// Define a more compatible Estimate interface that merges properties from both interfaces
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
  created_at: string;
  updated_at: string; // Changed from optional to required to match useEstimateData.ts
  notes?: string;
}

// Simplified placeholder version of useEstimates
export const useEstimates = (jobId: string, onEstimateConverted?: () => void) => {
  const [estimates] = useState<Estimate[]>([]);
  const [isLoading] = useState(false);
  
  return {
    estimates,
    isLoading,
    error: false,
    dialogs: {
      isUpsellDialogOpen: false,
      setIsUpsellDialogOpen: () => {},
      isEstimateBuilderOpen: false,
      setIsEstimateBuilderOpen: () => {},
      isEstimateDialogOpen: false,
      setIsEstimateDialogOpen: () => {},
      isConvertToInvoiceDialogOpen: false,
      setIsConvertToInvoiceDialogOpen: () => {},
      isDeleteConfirmOpen: false, 
      setIsDeleteConfirmOpen: () => {},
      isWarrantyDialogOpen: false,
      setIsWarrantyDialogOpen: () => {}
    },
    state: {
      selectedEstimateId: null,
      recommendedProduct: null,
      techniciansNote: "",
      selectedEstimate: null,
      isDeleting: false,
    },
    handlers: {
      handleCreateEstimate: () => {},
      handleEditEstimate: (id: string) => {},
      handleViewEstimate: (estimate: any) => {},
      handleSendEstimate: (id: string) => {},
      handleUpsellAccept: (product: any) => {},
      handleConvertToInvoice: (estimate: any) => {},
      confirmConvertToInvoice: async () => {},
      handleDeleteEstimate: (id: string) => {},
      confirmDeleteEstimate: async () => {},
      handleSyncToInvoice: () => {},
      handleAddWarranty: (estimate: any) => {},
      handleWarrantySelection: (warranty: any, note: string) => {},
      handleEstimateCreated: (amount: number) => {}
    },
    info: {
      clientInfo: {},
      companyInfo: {},
      jobInfo: {}
    }
  };
};
