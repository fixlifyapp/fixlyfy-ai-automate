
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem } from '@/components/jobs/builder/types';

interface DocumentData {
  documentType: 'estimate' | 'invoice';
  documentNumber: string;
  jobId: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  total: number;
}

export const useDocumentOperations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDocument = async (data: DocumentData) => {
    setIsSubmitting(true);
    try {
      const { documentType, documentNumber, jobId, lineItems, taxRate, notes, total } = data;
      
      const documentData = {
        job_id: jobId,
        items: lineItems,
        total,
        tax_rate: taxRate,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (documentType === 'estimate') {
        const { data: estimate, error } = await supabase
          .from('estimates')
          .insert({
            ...documentData,
            estimate_number: documentNumber,
            status: 'draft' as const, // Use const assertion for literal type
            subtotal: total - (total * taxRate),
            tax_amount: total * taxRate
          })
          .select()
          .single();

        if (error) throw error;
        return estimate;
      } else {
        const { data: invoice, error } = await supabase
          .from('invoices')
          .insert({
            ...documentData,
            invoice_number: documentNumber,
            status: 'draft' as const, // Use const assertion for literal type
            subtotal: total - (total * taxRate),
            tax_amount: total * taxRate,
            amount_paid: 0,
            balance: total,
            issue_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (error) throw error;
        return invoice;
      }
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error(`Failed to save ${data.documentType}: ${error.message}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDocument = async (id: string, data: Partial<DocumentData>) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        items: data.lineItems,
        total: data.total,
        tax_rate: data.taxRate,
        notes: data.notes,
        updated_at: new Date().toISOString()
      };

      if (data.documentType === 'estimate') {
        const { data: estimate, error } = await supabase
          .from('estimates')
          .update({
            ...updateData,
            subtotal: (data.total || 0) - ((data.total || 0) * (data.taxRate || 0)),
            tax_amount: (data.total || 0) * (data.taxRate || 0)
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return estimate;
      } else {
        const { data: invoice, error } = await supabase
          .from('invoices')
          .update({
            ...updateData,
            subtotal: (data.total || 0) - ((data.total || 0) * (data.taxRate || 0)),
            tax_amount: (data.total || 0) * (data.taxRate || 0),
            balance: (data.total || 0) - 0 // Assuming no payments when updating
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return invoice;
      }
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast.error(`Failed to update ${data.documentType}: ${error.message}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveDocument,
    updateDocument,
    isSubmitting
  };
};
