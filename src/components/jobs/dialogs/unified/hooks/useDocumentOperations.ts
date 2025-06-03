
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
    if (isSubmitting) {
      console.log("❌ Already submitting, skipping");
      return null;
    }
    
    setIsSubmitting(true);
    console.log('=== SAVE DOCUMENT CHANGES START ===');
    console.log('Document type:', documentType);
    console.log('Line items:', lineItems);
    console.log('Line items count:', lineItems.length);
    console.log('Form data:', formData);
    console.log('Job ID:', jobId);
    console.log('Job ID type:', typeof jobId);
    console.log('Total:', calculateGrandTotal());
    console.log('Notes:', notes);
    
    try {
      // Check if user is authenticated
      console.log('🔐 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('Authentication result:', { user: !!user, error: authError });
      
      if (authError || !user) {
        console.error('❌ Authentication error:', authError);
        throw new Error('Authentication required. Please log in to save documents.');
      }

      console.log('✅ User authenticated:', user.id);

      const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
      console.log('📋 Using table:', tableName);
      
      // Generate document number if not exists
      const documentNumber = formData.documentNumber || 
        `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`;
      
      console.log('📄 Document number:', documentNumber);
      
      // Validate job ID is string and not empty
      if (!jobId || typeof jobId !== 'string') {
        console.error('❌ Invalid job ID:', { jobId, type: typeof jobId });
        throw new Error('Invalid job ID provided');
      }
      
      // Create document data - ensure job_id is always a string
      const baseDocumentData = {
        job_id: String(jobId), // Explicitly convert to string
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

      console.log('📦 Document data to save:', documentData);

      let document;
      if (formData.documentId) {
        // Update existing document
        console.log('📝 Updating existing document:', formData.documentId);
        const { data, error } = await supabase
          .from(tableName)
          .update(documentData)
          .eq('id', formData.documentId)
          .select()
          .single();
          
        if (error) {
          console.error('❌ Error updating document:', error);
          throw new Error(`Failed to update ${documentType}: ${error.message}`);
        }
        document = data;
        console.log('✅ Document updated:', document);
      } else {
        // Create new document
        console.log('➕ Creating new document for job_id:', String(jobId));
        const { data, error } = await supabase
          .from(tableName)
          .insert(documentData)
          .select()
          .single();
          
        if (error) {
          console.error('❌ Error creating document:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw new Error(`Failed to create ${documentType}: ${error.message}`);
        }
        document = data;
        console.log('✅ Document created:', document);
      }
      
      // Handle line items
      if (document && lineItems.length > 0) {
        console.log('📋 Saving line items for document:', document.id);
        console.log('Line items to save:', lineItems);
        
        // Delete existing line items first
        console.log('🗑️ Deleting existing line items...');
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', document.id)
          .eq('parent_type', documentType);
          
        if (deleteError) {
          console.error('⚠️ Error deleting existing line items:', deleteError);
          // Don't throw here, just log as it might not exist
        } else {
          console.log('✅ Existing line items deleted');
        }
        
        // Create new line items
        const lineItemsData = lineItems.map((item, index) => {
          const lineItemData = {
            parent_id: document.id,
            parent_type: documentType,
            description: item.description || `Item ${index + 1}`,
            quantity: item.quantity || 1,
            unit_price: item.unitPrice || 0,
            taxable: item.taxable !== undefined ? item.taxable : true
          };
          console.log(`Line item ${index}:`, lineItemData);
          return lineItemData;
        });
        
        console.log('💾 Inserting line items:', lineItemsData);
        
        const { data: insertedLineItems, error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItemsData)
          .select();
          
        if (lineItemsError) {
          console.error('❌ Error creating line items:', lineItemsError);
          console.error('Line items error details:', {
            code: lineItemsError.code,
            message: lineItemsError.message,
            details: lineItemsError.details,
            hint: lineItemsError.hint
          });
          throw new Error(`Failed to save line items: ${lineItemsError.message}`);
        }
        
        console.log('✅ Line items saved successfully:', insertedLineItems);
      } else {
        console.log('ℹ️ No line items to save');
      }

      // Try to log to job history (don't fail if this doesn't work)
      try {
        console.log('📝 Attempting to log job history...');
        const { error: historyError } = await supabase
          .from('job_history')
          .insert({
            job_id: String(jobId),
            entity_id: document.id,
            entity_type: documentType,
            type: `${documentType}-created`,
            title: `${documentType === 'estimate' ? 'Estimate' : 'Invoice'} Created`,
            description: `New ${documentType} ${documentNumber} created with total $${calculateGrandTotal()}`,
            user_id: user.id,
            user_name: user.email,
            new_value: document
          });

        if (historyError) {
          console.warn('⚠️ Failed to log job history (non-critical):', historyError);
        } else {
          console.log('✅ Job history logged successfully');
        }
      } catch (historyErr) {
        console.warn('⚠️ Job history logging failed (non-critical):', historyErr);
      }
      
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} ${formData.documentId ? 'updated' : 'created'} successfully`);
      
      // Return standardized format
      if (documentType === 'estimate') {
        const result = {
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
        console.log('📋 Returning estimate result:', result);
        return result;
      } else {
        const result = {
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
        console.log('📋 Returning invoice result:', result);
        return result;
      }
    } catch (error: any) {
      console.error(`❌ Error saving ${documentType}:`, error);
      console.error('Error stack:', error.stack);
      
      // Show more specific error messages
      if (error.message.includes('row-level security')) {
        toast.error(`Access denied. Please ensure you're logged in and have permission to ${formData.documentId ? 'update' : 'create'} ${documentType}s.`);
      } else if (error.message.includes('Authentication required')) {
        toast.error(error.message);
      } else if (error.message.includes('invalid input syntax for type uuid')) {
        toast.error(`Invalid job ID format. Please refresh the page and try again.`);
      } else {
        toast.error(`Failed to save ${documentType}: ${error.message}`);
      }
      
      return null;
    } finally {
      setIsSubmitting(false);
      console.log('=== SAVE DOCUMENT CHANGES END ===');
    }
  }, [documentType, jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  // Enhanced conversion from estimate to invoice
  const convertToInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (documentType !== 'estimate' || !existingDocument) return null;

    try {
      setIsSubmitting(true);
      console.log('Converting estimate to invoice:', existingDocument.id);
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required to convert estimate to invoice.');
      }
      
      // Generate smart invoice number
      const estimateNumber = (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number;
      const invoiceNumber = `INV-${estimateNumber?.replace('EST-', '') || Date.now()}`;
      
      // Create invoice with enhanced data
      const invoiceData = {
        job_id: String(jobId), // Ensure this is passed as text
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
        throw new Error(`Failed to create invoice: ${error.message}`);
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
          throw new Error(`Failed to copy line items: ${lineItemsError.message}`);
        }
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', existingDocument.id);
        
      if (updateError) {
        console.error('Error updating estimate status:', updateError);
        // Don't throw here as the invoice was created successfully
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

    } catch (error: any) {
      console.error('Error converting to invoice:', error);
      
      if (error.message.includes('row-level security')) {
        toast.error('Access denied. Please ensure you have permission to create invoices.');
      } else {
        toast.error(`Failed to convert estimate to invoice: ${error.message}`);
      }
      
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
