
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
    console.log('Saving document:', { documentType, lineItems: lineItems.length, total: calculateGrandTotal(), jobId });
    
    try {
      const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
      
      // Generate document number if not exists
      const documentNumber = formData.documentNumber || 
        `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`;
      
      // Create document data with proper fields for each type
      const baseDocumentData = {
        job_id: jobId, // Ensure this is passed as text, not UUID
        total: calculateGrandTotal(),
        status: formData.status || (documentType === 'estimate' ? 'draft' : 'unpaid'),
        notes: notes || '',
        date: new Date().toISOString()
      };

      const documentData = documentType === 'estimate' 
        ? {
            ...baseDocumentData,
            estimate_number: documentNumber
          }
        : {
            ...baseDocumentData,
            invoice_number: documentNumber,
            amount_paid: 0,
            balance: calculateGrandTotal()
          };

      console.log('Document data to save:', documentData);

      let document;
      if (formData.documentId) {
        // Update existing document
        console.log('Updating existing document:', formData.documentId);
        const { data, error } = await supabase
          .from(tableName)
          .update(documentData)
          .eq('id', formData.documentId)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating document:', error);
          throw error;
        }
        document = data;
      } else {
        // Create new document
        console.log('Creating new document');
        const { data, error } = await supabase
          .from(tableName)
          .insert(documentData)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating document:', error);
          throw error;
        }
        document = data;
        console.log('Created document:', document);
      }
      
      // Handle line items
      if (document) {
        console.log('Saving line items for document:', document.id);
        
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
          
          console.log('Inserting line items:', lineItemsData);
          
          const { error: lineItemsError } = await supabase
            .from('line_items')
            .insert(lineItemsData);
            
          if (lineItemsError) {
            console.error('Error creating line items:', lineItemsError);
            throw lineItemsError;
          }
          
          console.log('Line items saved successfully');
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
      console.log('Converting estimate to invoice:', existingDocument.id);
      
      // Generate smart invoice number
      const estimateNumber = (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number;
      const invoiceNumber = `INV-${estimateNumber?.replace('EST-', '') || Date.now()}`;
      
      // Create invoice with enhanced data
      const invoiceData = {
        job_id: jobId, // Ensure this is passed as text
        estimate_id: existingDocument.id,
        invoice_number: invoiceNumber,
        total: calculateGrandTotal(),
        amount_paid: 0,
        balance: calculateGrandTotal(),
        status: 'unpaid',
        notes: notes || existingDocument.notes,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        date: new Date().toISOString()
      };

      console.log('Creating invoice:', invoiceData);

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }

      console.log('Created invoice:', invoice);

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

        console.log('Copying line items to invoice:', invoiceLineItems);

        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(invoiceLineItems);
          
        if (lineItemsError) {
          console.error('Error copying line items:', lineItemsError);
          throw lineItemsError;
        }
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', existingDocument.id);
        
      if (updateError) {
        console.error('Error updating estimate status:', updateError);
        throw updateError;
      }

      console.log('Estimate converted successfully');

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
