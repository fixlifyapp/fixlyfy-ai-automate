
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
      const subtotal = documentData.total / (1 + documentData.taxRate);
      const taxAmount = documentData.total - subtotal;

      if (documentData.documentType === 'estimate') {
        const estimateRecord = {
          job_id: documentData.jobId,
          estimate_number: documentData.documentNumber,
          total: documentData.total,
          subtotal: subtotal,
          tax_rate: documentData.taxRate,
          tax_amount: taxAmount,
          items: documentData.lineItems as any,
          notes: documentData.notes,
          status: 'draft'
        };

        const { data, error } = await supabase
          .from('estimates')
          .insert([estimateRecord])
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const invoiceRecord = {
          job_id: documentData.jobId,
          invoice_number: documentData.documentNumber,
          total: documentData.total,
          subtotal: subtotal,
          tax_rate: documentData.taxRate,
          tax_amount: taxAmount,
          items: documentData.lineItems as any,
          notes: documentData.notes,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabase
          .from('invoices')
          .insert([invoiceRecord])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
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
      const subtotal = documentData.total / (1 + documentData.taxRate);
      const taxAmount = documentData.total - subtotal;

      if (documentData.documentType === 'estimate') {
        const estimateRecord = {
          estimate_number: documentData.documentNumber,
          total: documentData.total,
          subtotal: subtotal,
          tax_rate: documentData.taxRate,
          tax_amount: taxAmount,
          items: documentData.lineItems as any,
          notes: documentData.notes,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('estimates')
          .update(estimateRecord)
          .eq('id', documentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const invoiceRecord = {
          invoice_number: documentData.documentNumber,
          total: documentData.total,
          subtotal: subtotal,
          tax_rate: documentData.taxRate,
          tax_amount: taxAmount,
          items: documentData.lineItems as any,
          notes: documentData.notes,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceRecord)
          .eq('id', documentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
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
      const subtotal = documentData.total / (1 + documentData.taxRate);
      const taxAmount = documentData.total - subtotal;

      // Create new invoice from estimate data
      const invoiceRecord = {
        job_id: documentData.jobId,
        estimate_id: estimateId,
        invoice_number: documentData.documentNumber,
        total: documentData.total,
        subtotal: subtotal,
        tax_rate: documentData.taxRate,
        tax_amount: taxAmount,
        items: documentData.lineItems as any,
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
