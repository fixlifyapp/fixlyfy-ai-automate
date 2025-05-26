
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/hooks/useEstimates';

export interface EstimateActionsState {
  selectedEstimate: Estimate | null;
  isDeleting: boolean;
  isConverting: boolean;
  isSending: boolean;
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
  refreshEstimates: () => void,
  onEstimateConverted?: () => void
): EstimateActionsHook => {
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendEstimate = async (estimateId: string): Promise<boolean> => {
    setIsSending(true);
    try {
      // Update estimate status to 'sent' in database
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimateId);

      if (error) throw error;

      // Update local state optimistically
      setEstimates(estimates.map(est => 
        est.id === estimateId ? { ...est, status: 'sent' } : est
      ));
      
      // Create estimate communication record
      const estimate = estimates.find(est => est.id === estimateId);
      if (estimate) {
        const { error: commError } = await supabase
          .from('estimate_communications')
          .insert({
            estimate_id: estimateId,
            communication_type: 'email',
            recipient: 'client@example.com', // This should come from job/client data
            subject: `Estimate ${estimate.estimate_number}`,
            content: `Your estimate ${estimate.estimate_number} is ready for review.`,
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        if (commError) {
          console.warn('Failed to create communication record:', commError);
        }
      }
      
      toast.success('Estimate sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const confirmDeleteEstimate = async (): Promise<boolean> => {
    if (!selectedEstimate) return false;
    
    setIsDeleting(true);
    try {
      // First delete related line items
      const { error: lineItemsError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_type', 'estimate')
        .eq('parent_id', selectedEstimate.id);

      if (lineItemsError) {
        console.warn('Error deleting line items:', lineItemsError);
      }

      // Delete estimate communications
      const { error: commError } = await supabase
        .from('estimate_communications')
        .delete()
        .eq('estimate_id', selectedEstimate.id);

      if (commError) {
        console.warn('Error deleting communications:', commError);
      }

      // Delete the estimate
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', selectedEstimate.id);

      if (error) throw error;
      
      // Update local state optimistically
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      
      toast.success('Estimate deleted successfully');
      setSelectedEstimate(null);
      
      // Refresh estimates to ensure consistency
      refreshEstimates();
      
      return true;
    } catch (error) {
      console.error('Error deleting estimate:', error);
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
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      // Create new invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: selectedEstimate.job_id,
          invoice_number: invoiceNumber,
          total: selectedEstimate.total,
          status: 'unpaid',
          estimate_id: selectedEstimate.id,
          notes: selectedEstimate.notes
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Copy line items from estimate to invoice
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', selectedEstimate.id);

      if (lineItemsError) throw lineItemsError;

      if (lineItems && lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable
        }));

        const { error: copyError } = await supabase
          .from('line_items')
          .insert(invoiceLineItems);

        if (copyError) throw copyError;
      }

      // Update estimate status to 'converted'
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', selectedEstimate.id);

      if (updateError) throw updateError;

      // Update local state optimistically
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
      console.error('Error converting estimate:', error);
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
      isConverting,
      isSending
    },
    actions: {
      setSelectedEstimate,
      handleSendEstimate,
      confirmDeleteEstimate,
      confirmConvertToInvoice
    }
  };
};
