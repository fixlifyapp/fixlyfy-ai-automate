
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

export const useDocumentOperations = (props?: {
  documentType?: "estimate" | "invoice";
  existingDocument?: any;
  jobId?: string;
  formData?: any;
  lineItems?: any[];
  notes?: string;
  calculateGrandTotal?: () => number;
  onSyncToInvoice?: () => void;
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { logEstimateCreated, logInvoiceCreated, logEstimateConverted } = useJobHistoryIntegration();

  const createEstimate = async (estimateData: any) => {
    setIsCreating(true);
    try {
      // Get next estimate number
      const { data: counter } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'estimate'
      });

      const estimateNumber = counter || '1';

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
      const { data: counter } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'invoice'
      });

      const invoiceNumber = counter || '1';

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

  const convertToInvoice = async () => {
    if (!props?.existingDocument || props.documentType !== "estimate") {
      throw new Error("Can only convert estimates to invoices");
    }

    setIsCreating(true);
    try {
      // Get next invoice number
      const { data: counter } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'invoice'
      });

      const invoiceNumber = counter || '1';

      // Create invoice from estimate
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          job_id: props.existingDocument.job_id,
          client_id: props.existingDocument.client_id,
          estimate_id: props.existingDocument.id,
          invoice_number: invoiceNumber,
          title: props.existingDocument.title,
          description: props.existingDocument.description,
          items: props.existingDocument.items,
          subtotal: props.existingDocument.subtotal,
          tax_rate: props.existingDocument.tax_rate,
          tax_amount: props.existingDocument.tax_amount,
          total: props.existingDocument.total,
          notes: props.existingDocument.notes,
          terms: props.existingDocument.terms,
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      // Update estimate status
      await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', props.existingDocument.id);

      // Log conversion to job history
      await logEstimateConverted(
        props.existingDocument.job_id,
        props.existingDocument.estimate_number,
        invoiceNumber,
        props.existingDocument.total
      );

      toast.success('Estimate converted to invoice successfully');
      props.onSyncToInvoice?.();
      return invoice;
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const saveDocumentChanges = async () => {
    if (!props?.existingDocument || !props.formData) {
      throw new Error("Missing document or form data");
    }

    setIsCreating(true);
    try {
      const tableName = props.documentType === "estimate" ? "estimates" : "invoices";
      
      const { error } = await supabase
        .from(tableName)
        .update({
          items: props.formData.items,
          notes: props.formData.notes,
          total: props.formData.total,
          updated_at: new Date().toISOString()
        })
        .eq('id', props.existingDocument.id);

      if (error) throw error;

      toast.success(`${props.documentType} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${props.documentType}:`, error);
      toast.error(`Failed to update ${props.documentType}`);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createEstimate,
    createInvoice,
    convertToInvoice,
    saveDocumentChanges,
    isCreating,
    isSubmitting: isCreating
  };
};
