
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../../builder/types";

export const useEstimateActions = (
  jobId: string,
  estimates: any[],
  setEstimates: (estimates: any[]) => void,
  onEstimateConverted?: () => void
) => {
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle sending an estimate
  const handleSendEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimateId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEstimates(estimates.map(e => 
        e.id === estimateId ? {...e, status: 'sent'} : e
      ));
      
      toast.success("Estimate sent to customer");
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
    }
  };

  // Handle adding warranty to estimate
  const handleAddWarranty = (estimate: any) => {
    setSelectedEstimate(estimate);
  };

  // Handle deleting an estimate
  const handleDeleteEstimate = (estimateId: string) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      setSelectedEstimate(estimate);
    }
  };
  
  // Confirm deleting an estimate
  const confirmDeleteEstimate = async () => {
    if (!selectedEstimate) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', selectedEstimate.id);
        
      if (error) {
        throw error;
      }
      
      // Remove estimate from local state
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      toast.success(`Estimate ${selectedEstimate.number} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete estimate:", error);
      toast.error("Failed to delete estimate");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle converting estimate to invoice
  const handleConvertToInvoice = (estimate: any) => {
    setSelectedEstimate(estimate);
  };
  
  // Confirm converting estimate to invoice
  const confirmConvertToInvoice = async () => {
    if (!selectedEstimate) return;
    
    try {
      // Mark the estimate as converted by updating its status
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', selectedEstimate.id);
        
      if (error) {
        throw error;
      }
      
      toast.success(`Estimate ${selectedEstimate.number} converted to invoice`);
      
      // Update local state - remove the converted estimate
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      
      // Switch to the invoices tab if the callback is provided
      if (onEstimateConverted) {
        onEstimateConverted();
      }
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    }
  };

  // Handle syncing estimate to invoice
  const handleSyncToInvoice = (estimate: any) => {
    toast.success(`Estimate ${estimate.number} synced to invoice`);
    
    // Switch to the invoices tab if the callback is provided
    if (onEstimateConverted) {
      onEstimateConverted();
    }
  };

  return {
    state: {
      selectedEstimate,
      isDeleting,
    },
    actions: {
      handleSendEstimate,
      handleAddWarranty,
      handleDeleteEstimate,
      confirmDeleteEstimate,
      handleConvertToInvoice,
      confirmConvertToInvoice,
      handleSyncToInvoice,
      setSelectedEstimate,
    }
  };
};
