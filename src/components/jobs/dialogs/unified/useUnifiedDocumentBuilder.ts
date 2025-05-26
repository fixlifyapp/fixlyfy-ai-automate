
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";

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

interface UseUnifiedDocumentBuilderProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  open: boolean;
  onSyncToInvoice?: () => void;
}

export const useUnifiedDocumentBuilder = ({ 
  documentType, 
  existingDocument, 
  jobId, 
  open, 
  onSyncToInvoice 
}: UseUnifiedDocumentBuilderProps) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentNumber: `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`,
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProduct = useCallback((product: Product) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.description || product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      taxable: product.taxable,
      discount: 0,
      ourPrice: product.ourPrice || 0,
      name: product.name,
      price: product.price,
      total: (product.quantity || 1) * product.price
    };
    
    setLineItems(prev => [...prev, newLineItem]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  }, []);

  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const calculateTotalTax = useCallback(() => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  }, [calculateSubtotal, taxRate]);

  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  const calculateTotalMargin = useCallback(() => {
    return lineItems.reduce((sum, item) => {
      const itemMargin = (item.unitPrice - (item.ourPrice || 0)) * item.quantity;
      return sum + itemMargin;
    }, 0);
  }, [lineItems]);

  const calculateMarginPercentage = useCallback(() => {
    const totalRevenue = calculateSubtotal();
    const totalMargin = calculateTotalMargin();
    return totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  }, [calculateSubtotal, calculateTotalMargin]);

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

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    documentNumber: formData.documentNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    saveDocumentChanges
  };
};
