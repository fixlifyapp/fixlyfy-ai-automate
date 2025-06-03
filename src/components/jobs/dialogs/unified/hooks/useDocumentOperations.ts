
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { LineItem } from "../../../builder/types";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentFormData {
  documentId?: string;
  documentNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}

interface UseDocumentOperationsProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  formData: DocumentFormData;
  lineItems: LineItem[];
  notes: string;
  calculateGrandTotal: () => number;
  onSyncToInvoice?: () => void;
}

export const useDocumentOperations = ({
  documentType,
  existingDocument,
  jobId,
  formData,
  lineItems,
  notes,
  calculateGrandTotal,
  onSyncToInvoice
}: UseDocumentOperationsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDocumentChanges = useCallback(async (): Promise<Estimate | Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
      
      // Create document data with proper fields for each type
      const baseDocumentData = {
        job_id: jobId,
        total: calculateGrandTotal(),
        status: formData.status,
        notes: notes
      };

      const documentData = documentType === 'estimate' 
        ? {
            ...baseDocumentData,
            estimate_number: formData.documentNumber
          }
        : {
            ...baseDocumentData,
            invoice_number: formData.documentNumber,
            amount_paid: 0,
            balance: calculateGrandTotal()
          };

      let document;
      if (formData.documentId) {
        // Update existing document
        const { data, error } = await supabase
          .from(tableName)
          .update(documentData)
          .eq('id', formData.documentId)
          .select()
          .single();
          
        if (error) throw error;
        document = data;
      } else {
        // Create new document
        const { data, error } = await supabase
          .from(tableName)
          .insert(documentData)
          .select()
          .single();
          
        if (error) throw error;
        document = data;
      }
      
      // Handle line items
      if (document) {
        // Delete existing line items
        await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', document.id)
          .eq('parent_type', documentType);
        
        // Create new line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            parent_id: document.id,
            parent_type: documentType,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            taxable: item.taxable
          }));
          
          await supabase
            .from('line_items')
            .insert(lineItemsData);
        }
      }
      
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} ${formData.documentId ? 'updated' : 'created'} successfully`);
      
      // Return standardized format
      if (documentType === 'estimate') {
        return {
          id: document.id,
          job_id: document.job_id,
          estimate_number: document.estimate_number,
          number: document.estimate_number,
          date: document.date || document.created_at,
          total: document.total,
          amount: document.total,
          status: document.status,
          notes: document.notes,
          created_at: document.created_at,
          updated_at: document.updated_at
        };
      } else {
        return {
          id: document.id,
          job_id: document.job_id,
          invoice_number: document.invoice_number,
          number: document.invoice_number,
          date: document.date || document.created_at,
          total: document.total,
          amount_paid: document.amount_paid || 0,
          balance: (document.total || 0) - (document.amount_paid || 0),
          status: document.status,
          notes: document.notes,
          created_at: document.created_at,
          updated_at: document.updated_at
        };
      }
    } catch (error) {
      console.error(`Error saving ${documentType}:`, error);
      toast.error(`Failed to save ${documentType}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [documentType, jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  // Enhanced conversion from estimate to invoice
  const convertToInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (documentType !== 'estimate' || !existingDocument) return null;

    try {
      setIsSubmitting(true);
      
      // Generate smart invoice number
      const estimateNumber = (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number;
      const invoiceNumber = `INV-${estimateNumber?.replace('EST-', '') || Date.now()}`;
      
      // Create invoice with enhanced data
      const invoiceData = {
        job_id: jobId,
        estimate_id: existingDocument.id,
        invoice_number: invoiceNumber,
        total: calculateGrandTotal(),
        amount_paid: 0,
        balance: calculateGrandTotal(),
        status: 'unpaid',
        notes: notes || existingDocument.notes,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      // Copy line items to invoice
      if (lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));

        await supabase
          .from('line_items')
          .insert(invoiceLineItems);
      }

      // Update estimate status
      await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', existingDocument.id);

      toast.success('Estimate successfully converted to invoice');
      
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }

      return {
        id: invoice.id,
        job_id: invoice.job_id,
        invoice_number: invoice.invoice_number,
        number: invoice.invoice_number,
        date: invoice.date || invoice.created_at,
        total: invoice.total,
        amount_paid: invoice.amount_paid || 0,
        balance: invoice.balance || invoice.total,
        status: invoice.status,
        notes: invoice.notes,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      };

    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [existingDocument, documentType, jobId, lineItems, notes, calculateGrandTotal, onSyncToInvoice]);

  return {
    isSubmitting,
    saveDocumentChanges,
    convertToInvoice
  };
};
