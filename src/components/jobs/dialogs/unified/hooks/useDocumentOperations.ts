
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DocumentType } from '../../UnifiedDocumentBuilder';
import { LineItem } from '@/components/jobs/builder/types';

interface DocumentData {
  documentType: DocumentType;
  documentNumber: string;
  jobId: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  total: number;
}

export const useDocumentOperations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDocument = async (documentData: DocumentData) => {
    setIsSubmitting(true);
    try {
      const table = documentData.documentType === 'estimate' ? 'estimates' : 'invoices';
      const numberField = documentData.documentType === 'estimate' ? 'estimate_number' : 'invoice_number';
      
      const record = {
        job_id: documentData.jobId,
        [numberField]: documentData.documentNumber,
        total: documentData.total,
        subtotal: documentData.total / (1 + documentData.taxRate),
        tax_rate: documentData.taxRate,
        tax_amount: documentData.total - (documentData.total / (1 + documentData.taxRate)),
        items: documentData.lineItems as any, // Cast to Json type for Supabase
        notes: documentData.notes,
        status: 'draft'
      };

      const { data, error } = await supabase
        .from(table)
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      toast.success(`${documentData.documentType === 'estimate' ? 'Estimate' : 'Invoice'} saved successfully`);
      return data;
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDocument = async (documentId: string, documentData: DocumentData) => {
    setIsSubmitting(true);
    try {
      const table = documentData.documentType === 'estimate' ? 'estimates' : 'invoices';
      const numberField = documentData.documentType === 'estimate' ? 'estimate_number' : 'invoice_number';
      
      const record = {
        [numberField]: documentData.documentNumber,
        total: documentData.total,
        subtotal: documentData.total / (1 + documentData.taxRate),
        tax_rate: documentData.taxRate,
        tax_amount: documentData.total - (documentData.total / (1 + documentData.taxRate)),
        items: documentData.lineItems as any, // Cast to Json type for Supabase
        notes: documentData.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(table)
        .update(record)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      toast.success(`${documentData.documentType === 'estimate' ? 'Estimate' : 'Invoice'} updated successfully`);
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertToInvoice = async (estimateId: string, documentData: DocumentData) => {
    setIsSubmitting(true);
    try {
      // Create new invoice from estimate data
      const invoiceRecord = {
        job_id: documentData.jobId,
        estimate_id: estimateId,
        invoice_number: documentData.documentNumber,
        total: documentData.total,
        subtotal: documentData.total / (1 + documentData.taxRate),
        tax_rate: documentData.taxRate,
        tax_amount: documentData.total - (documentData.total / (1 + documentData.taxRate)),
        items: documentData.lineItems as any, // Cast to Json type for Supabase
        notes: documentData.notes,
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0]
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceRecord])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update estimate status to converted
      const { error: estimateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);

      if (estimateError) throw estimateError;

      toast.success('Estimate converted to invoice successfully');
      return invoice;
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    saveDocument,
    updateDocument,
    convertToInvoice
  };
};
