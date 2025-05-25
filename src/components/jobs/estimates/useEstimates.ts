
import { useState, useEffect } from "react";
import { useEstimateData } from "./hooks/useEstimateData";
import { useEstimateActions } from "./hooks/useEstimateActions";
import { useEstimateCreation } from "./hooks/useEstimateCreation";
import { useEstimateWarranty } from "./hooks/useEstimateWarranty";
import { useEstimateUpsell } from "./hooks/useEstimateUpsell";
import { useEstimateInfo } from "./hooks/useEstimateInfo";
import { Estimate } from "@/hooks/useEstimates";

export const useEstimates = (jobId: string, onEstimateConverted?: () => void) => {
  // Get estimates data
  const { estimates: estimatesData, setEstimates: setEstimatesData, isLoading } = useEstimateData(jobId);
  
  // Convert estimates to the expected format
  const estimates: Estimate[] = estimatesData.map(estimate => ({
    ...estimate,
    number: estimate.estimate_number,
    amount: estimate.total,
    notes: estimate.notes || ''
  }));

  // Dialog state management
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [isConvertToInvoiceDialogOpen, setIsConvertToInvoiceDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [error, setError] = useState<boolean>(false);

  // Create a wrapper for setEstimatesData to handle type conversion
  const setEstimatesWrapper = (newEstimates: Estimate[]) => {
    // Convert back to the internal format
    const convertedEstimates = newEstimates.map(estimate => ({
      ...estimate,
      estimate_number: estimate.number || estimate.estimate_number,
      total: estimate.amount || estimate.total
    }));
    setEstimatesData(convertedEstimates);
  };

  // Get hooks for different functionalities
  const estimateActions = useEstimateActions(jobId, estimates, setEstimatesWrapper, onEstimateConverted);
  const estimateCreation = useEstimateCreation(jobId, estimates, setEstimatesWrapper);
  const estimateUpsell = useEstimateUpsell(estimates, setEstimatesWrapper);
  
  // Get client and company info
  const estimateInfo = useEstimateInfo(jobId);
  
  // Check if there was an error loading job information
  useEffect(() => {
    if (estimateInfo.jobInfo && estimateInfo.jobInfo.title === "Error Loading Job") {
      setError(true);
    } else {
      setError(false);
    }
  }, [estimateInfo.jobInfo]);
  
  // Get warranty functionality (depends on selectedEstimate from actions)
  const estimateWarranty = useEstimateWarranty(
    estimates, 
    setEstimatesWrapper, 
    estimateActions.state.selectedEstimate
  );

  // Combined view estimate handler
  const handleViewEstimate = (estimate: Estimate) => {
    const shouldShowUpsell = estimateUpsell.actions.handleViewEstimate(estimate);
    
    if (shouldShowUpsell) {
      setIsUpsellDialogOpen(true);
    } else {
      // Just view/edit the estimate
      estimateCreation.actions.handleEditEstimate(estimate.id);
      setIsEstimateBuilderOpen(true);
    }
  };

  // Handle edit estimate with improved debugging
  const handleEditEstimate = (estimateId: string) => {
    console.log("handleEditEstimate called with ID:", estimateId);
    
    // First, set the selectedEstimateId in the creation hook
    estimateCreation.actions.handleEditEstimate(estimateId);
    
    // Then, make sure to open the estimate builder dialog
    setIsEstimateBuilderOpen(true);
  };

  // Handle add warranty with dialog opening
  const handleAddWarranty = (estimate: Estimate) => {
    estimateActions.actions.setSelectedEstimate(estimate);
    setIsWarrantyDialogOpen(true);
  };

  // Handle convert to invoice with dialog opening
  const handleConvertToInvoice = (estimate: Estimate) => {
    estimateActions.actions.setSelectedEstimate(estimate);
    setIsConvertToInvoiceDialogOpen(true);
  };

  // Handle create estimate - now opens EstimateBuilderDialog instead
  const handleCreateEstimate = () => {
    setIsEstimateBuilderOpen(true);
  };

  // Handle delete estimate with dialog opening
  const handleDeleteEstimate = (estimateId: string) => {
    estimateActions.actions.handleDeleteEstimate(estimateId);
    setIsDeleteConfirmOpen(true);
  };

  // Convert the handleSendEstimate to accept string ID instead of estimate object
  const handleSendEstimate = (estimateId: string) => {
    estimateActions.actions.handleSendEstimate(estimateId);
  };

  return {
    estimates,
    isLoading,
    error,
    dialogs: {
      isUpsellDialogOpen,
      setIsUpsellDialogOpen,
      isEstimateBuilderOpen,
      setIsEstimateBuilderOpen,
      isConvertToInvoiceDialogOpen,
      setIsConvertToInvoiceDialogOpen,
      isDeleteConfirmOpen, 
      setIsDeleteConfirmOpen,
      isWarrantyDialogOpen,
      setIsWarrantyDialogOpen
    },
    state: {
      selectedEstimateId: estimateCreation.state.selectedEstimateId,
      recommendedProduct: estimateUpsell.state.recommendedProduct,
      techniciansNote: estimateUpsell.state.techniciansNote,
      selectedEstimate: estimateActions.state.selectedEstimate,
      isDeleting: estimateActions.state.isDeleting,
    },
    handlers: {
      handleCreateEstimate,
      handleEditEstimate,
      handleViewEstimate,
      handleSendEstimate,
      handleUpsellAccept: estimateUpsell.actions.handleUpsellAccept,
      handleConvertToInvoice,
      confirmConvertToInvoice: estimateActions.actions.confirmConvertToInvoice,
      handleDeleteEstimate,
      confirmDeleteEstimate: estimateActions.actions.confirmDeleteEstimate,
      handleSyncToInvoice: estimateActions.actions.handleSyncToInvoice,
      handleAddWarranty,
      handleWarrantySelection: estimateWarranty.handleWarrantySelection,
      handleEstimateCreated: estimateCreation.actions.handleEstimateCreated
    },
    info: estimateInfo
  };
};
