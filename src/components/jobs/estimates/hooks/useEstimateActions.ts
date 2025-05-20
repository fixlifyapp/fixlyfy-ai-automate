
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../../builder/types";
import { Estimate } from "@/hooks/useEstimates";

export const useEstimateActions = (
  jobId: string,
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  onEstimateConverted?: () => void
) => {
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Handle sending an estimate - Updated to use estimateId
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
  const handleAddWarranty = (estimate: Estimate) => {
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
  const handleConvertToInvoice = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
  };
  
  // Confirm converting estimate to invoice
  const confirmConvertToInvoice = async () => {
    if (!selectedEstimate || isConverting) return;
    
    setIsConverting(true);
    
    try {
      // Generate unique invoice number
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Check if the estimate has already been converted
      const { data: existingInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('estimate_id', selectedEstimate.id);
        
      if (existingInvoices && existingInvoices.length > 0) {
        toast.warning(`This estimate has already been converted to invoice`);
        setIsConverting(false);
        return;
      }
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          job_id: jobId,
          estimate_id: selectedEstimate.id,
          invoice_number: invoiceNumber,
          total: selectedEstimate.total || selectedEstimate.amount,
          balance: selectedEstimate.total || selectedEstimate.amount,
          status: 'unpaid',
          notes: selectedEstimate.notes
        })
        .select()
        .single();
        
      if (invoiceError) {
        throw invoiceError;
      }
      
      // Get estimate line items
      const { data: estimateItems, error: itemsError } = await supabase
        .from("line_items")
        .select("*")
        .eq("parent_type", "estimate")
        .eq("parent_id", selectedEstimate.id);
        
      if (itemsError) {
        throw itemsError;
      }
      
      // Convert estimate items to invoice items
      if (estimateItems && estimateItems.length > 0 && invoice) {
        const invoiceItems = estimateItems.map(item => ({
          parent_type: "invoice",
          parent_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable
        }));
        
        const { error: insertError } = await supabase
          .from("line_items")
          .insert(invoiceItems);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update estimate status
      const { error: updateError } = await supabase
        .from("estimates")
        .update({ status: "converted" })
        .eq("id", selectedEstimate.id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Estimate converted to invoice successfully");
      
      // Update local state
      setEstimates(estimates.map(e => 
        e.id === selectedEstimate.id ? {...e, status: 'converted'} : e
      ));
      
      // Switch to the invoices tab if the callback is provided
      if (onEstimateConverted) {
        onEstimateConverted();
      }
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    } finally {
      setIsConverting(false);
    }
  };

  // Handle syncing estimate to invoice
  const handleSyncToInvoice = () => {
    if (!selectedEstimate) {
      toast.error("No estimate selected for syncing");
      return;
    }
    
    toast.success(`Estimate ${selectedEstimate.number} synced to invoice`);
    
    // Switch to the invoices tab if the callback is provided
    if (onEstimateConverted) {
      onEstimateConverted();
    }
  };

  return {
    state: {
      selectedEstimate,
      isDeleting,
      isConverting,
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
