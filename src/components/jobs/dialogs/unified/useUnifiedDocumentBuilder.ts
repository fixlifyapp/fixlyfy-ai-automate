
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { useDocumentInitialization } from "./hooks/useDocumentInitialization";
import { useDocumentCalculations } from "./hooks/useDocumentCalculations";
import { useDocumentSmartFeatures } from "./hooks/useDocumentSmartFeatures";
import { useDocumentOperations } from "./hooks/useDocumentOperations";

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
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");

  // Use initialization hook
  const { formData, setFormData, jobData } = useDocumentInitialization({
    documentType,
    existingDocument,
    jobId,
    open
  });

  // Use calculations hook
  const calculations = useDocumentCalculations({ lineItems, taxRate });

  // Use smart features hook
  const { generateSmartNotes, addProductWithSmartPricing } = useDocumentSmartFeatures();

  // Use operations hook
  const { isSubmitting, saveDocumentChanges, convertToInvoice } = useDocumentOperations({
    documentType,
    existingDocument,
    jobId,
    formData,
    lineItems,
    notes,
    calculateGrandTotal: calculations.calculateGrandTotal,
    onSyncToInvoice
  });

  // Auto-populate from job description for new documents
  useEffect(() => {
    if (!existingDocument && jobData?.description && open) {
      const smartNote = generateSmartNotes(jobData, documentType);
      setNotes(smartNote);
    }
  }, [existingDocument, jobData, open, generateSmartNotes, documentType]);

  // Initialize from existing document with smart conversion
  useEffect(() => {
    if (existingDocument && open) {
      const initializeFromExisting = async () => {
        try {
          // Get document number safely
          const documentNumber = documentType === 'estimate' 
            ? (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number
            : (existingDocument as Invoice).invoice_number || (existingDocument as Invoice).number;

          // Get total/amount safely
          const total = documentType === 'estimate'
            ? (existingDocument as Estimate).total || (existingDocument as Estimate).amount || 0
            : (existingDocument as Invoice).total || 0;

          // Set basic document data
          setFormData({
            documentId: existingDocument.id,
            documentNumber: documentNumber || '',
            items: [],
            notes: existingDocument.notes || "",
            status: existingDocument.status || "draft",
            total: total
          });

          setNotes(existingDocument.notes || "");

          // Fetch line items with smart enhancements
          const { data: items } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_id', existingDocument.id)
            .eq('parent_type', documentType === 'estimate' ? 'estimate' : 'invoice');

          if (items) {
            const enhancedLineItems: LineItem[] = items.map(item => ({
              id: item.id,
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: item.unit_price || 0,
              taxable: item.taxable !== undefined ? item.taxable : true,
              discount: 0,
              ourPrice: 0,
              name: item.description || '',
              price: item.unit_price || 0,
              total: (item.quantity || 1) * (item.unit_price || 0)
            }));

            setLineItems(enhancedLineItems);
          }

        } catch (error) {
          console.error('Error loading existing document:', error);
        }
      };

      initializeFromExisting();
    }
  }, [existingDocument, open, documentType, setFormData]);

  const handleAddProduct = useCallback(async (product: Product) => {
    await addProductWithSmartPricing(product, setLineItems);
  }, [addProductWithSmartPricing]);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  }, []);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    documentNumber: formData.documentNumber,
    isSubmitting,
    jobData,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    ...calculations,
    saveDocumentChanges,
    convertToInvoice
  };
};
