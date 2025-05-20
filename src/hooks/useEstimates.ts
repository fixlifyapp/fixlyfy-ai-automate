
import { useState } from 'react';

// Define the Estimate type with required properties
// This is kept as a placeholder for your future implementation
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
  items?: any[];
  recommendedProduct?: any;
  techniciansNote?: string;
}

// Simplified version of useEstimates that returns empty data
export const useEstimates = (jobId: string, onEstimateConverted?: () => void) => {
  const [estimates] = useState<Estimate[]>([]);
  const [isLoading] = useState(false);
  
  return {
    estimates,
    isLoading,
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
      selectedEstimateId: '',
      recommendedProduct: null,
      techniciansNote: '',
      selectedEstimate: null,
      isDeleting: false,
    },
    handlers: {
      handleCreateEstimate: () => {},
      handleEditEstimate: () => {},
      handleViewEstimate: () => {},
      handleSendEstimate: () => {},
      handleUpsellAccept: () => {},
      handleConvertToInvoice: () => {},
      confirmConvertToInvoice: () => {},
      handleDeleteEstimate: () => {},
      confirmDeleteEstimate: () => {},
      handleSyncToInvoice: () => {},
      handleAddWarranty: () => {},
      handleWarrantySelection: () => {},
      handleEstimateCreated: () => {}
    },
    info: {
      clientInfo: {},
      companyInfo: {},
      jobInfo: {},
      isLoading: false
    },
    error: false
  };
};
