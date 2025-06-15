
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

export const useDocumentOperations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { logEstimateCreated, logInvoiceCreated } = useJobHistoryIntegration();

  const createEstimate = async (estimateData: any) => {
    setIsCreating(true);
    try {
      // Get next estimate number
      const { data: counter } = await supabase.rpc('get_next_sequence_number', {
        entity_type: 'estimate'
      });

      const estimateNumber = counter?.toString() || '1';

      const { data, error } = await supabase
        .from('estimates')
        .insert({
          ...estimateData,
          estimate_number: estimateNumber,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Log to job history
      await logEstimateCreated(
        estimateData.job_id,
        estimateNumber,
        estimateData.total || 0
      );

      toast.success('Estimate created successfully');
      return data;
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast.error('Failed to create estimate');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createInvoice = async (invoiceData: any) => {
    setIsCreating(true);
    try {
      // Get next invoice number
      const { data: counter } = await supabase.rpc('get_next_sequence_number', {
        entity_type: 'invoice'
      });

      const invoiceNumber = counter?.toString() || '1';

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Log to job history
      await logInvoiceCreated(
        invoiceData.job_id,
        invoiceNumber,
        invoiceData.total || 0
      );

      toast.success('Invoice created successfully');
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createEstimate,
    createInvoice,
    isCreating
  };
};
