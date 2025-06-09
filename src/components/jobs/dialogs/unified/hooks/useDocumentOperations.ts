
import { useCallback, useState } from "react";
import { toast } from "sonner";
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
    console.log('=== SAVE DOCUMENT CHANGES START (MOCK) ===');
    console.log('Document type:', documentType);
    console.log('Line items:', lineItems);
    console.log('Form data:', formData);
    console.log('Job ID:', jobId);
    console.log('Total:', calculateGrandTotal());
    console.log('Notes:', notes);
    
    try {
      // Mock save functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const documentNumber = formData.documentNumber || 
        `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`;
      
      // Mock document data
      const mockDocument = {
        id: formData.documentId || `mock-${Date.now()}`,
        job_id: String(jobId),
        total: calculateGrandTotal(),
        status: formData.status || (documentType === 'estimate' ? 'draft' : 'unpaid'),
        notes: notes || '',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: lineItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }))
      };

      if (documentType === 'estimate') {
        const result = {
          ...mockDocument,
          estimate_number: documentNumber,
          number: documentNumber,
          amount: mockDocument.total
        };
        
        toast.success(`Estimate ${formData.documentId ? 'updated' : 'created'} successfully`);
        console.log('✅ Mock estimate saved:', result);
        return result;
      } else {
        const result = {
          ...mockDocument,
          invoice_number: documentNumber,
          number: documentNumber,
          amount_paid: 0,
          balance: mockDocument.total
        };
        
        toast.success(`Invoice ${formData.documentId ? 'updated' : 'created'} successfully`);
        console.log('✅ Mock invoice saved:', result);
        return result;
      }
    } catch (error: any) {
      console.error(`❌ Error saving ${documentType}:`, error);
      toast.error(`Failed to save ${documentType}: ${error.message}`);
      return null;
    } finally {
      setIsSubmitting(false);
      console.log('=== SAVE DOCUMENT CHANGES END (MOCK) ===');
    }
  }, [documentType, jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  // Enhanced conversion from estimate to invoice
  const convertToInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (documentType !== 'estimate' || !existingDocument) return null;

    try {
      setIsSubmitting(true);
      console.log('Converting estimate to invoice (MOCK):', existingDocument.id);
      
      // Mock conversion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const estimateNumber = (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number;
      const invoiceNumber = `INV-${estimateNumber?.replace('EST-', '') || Date.now()}`;
      
      // Mock invoice data
      const mockInvoice = {
        id: `mock-invoice-${Date.now()}`,
        job_id: String(jobId),
        estimate_id: existingDocument.id,
        invoice_number: invoiceNumber,
        number: invoiceNumber,
        date: new Date().toISOString(),
        total: calculateGrandTotal(),
        amount_paid: 0,
        balance: calculateGrandTotal(),
        status: 'unpaid',
        notes: notes || existingDocument.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: lineItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }))
      };

      console.log('✅ Mock invoice created:', mockInvoice);
      toast.success('Estimate successfully converted to invoice');
      
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }

      return mockInvoice;

    } catch (error: any) {
      console.error('Error converting to invoice:', error);
      toast.error(`Failed to convert estimate to invoice: ${error.message}`);
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
