
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { LineItem, Product } from "../../builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { useDocumentInitialization } from "./hooks/useDocumentInitialization";
import { useDocumentCalculations } from "./hooks/useDocumentCalculations";
import { useDocumentOperations } from "./hooks/useDocumentOperations";
import { useDocumentSmartFeatures } from "./hooks/useDocumentSmartFeatures";
import { useJobs } from "@/hooks/useJobs";

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
  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId);

  // Initialize document state
  const {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isInitialized
  } = useDocumentInitialization({
    documentType,
    existingDocument,
    jobId,
    open
  });

  // Calculate totals
  const {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage
  } = useDocumentCalculations({ lineItems, taxRate });

  // Smart features
  const smartFeatures = useDocumentSmartFeatures({
    documentType,
    lineItems,
    jobId
  });

  // Document operations
  const operations = useDocumentOperations();

  // Job data for display
  const jobData = {
    id: jobId,
    title: job?.title || 'Service Request',
    client: job?.client,
    description: job?.description
  };

  // Document save method - Returns boolean for success/failure
  const saveDocumentChanges = async (): Promise<boolean> => {
    try {
      const documentData = {
        documentType,
        documentNumber,
        jobId,
        lineItems,
        taxRate,
        notes,
        total: calculateGrandTotal()
      };

      if (existingDocument?.id) {
        const result = await operations.updateDocument(existingDocument.id, documentData);
        return !!result; // Convert to boolean
      } else {
        const result = await operations.saveDocument(documentData);
        return !!result; // Convert to boolean
      }
    } catch (error) {
      console.error('Error saving document changes:', error);
      return false;
    }
  };

  // Convert to invoice method - Returns boolean for success/failure
  const convertToInvoice = async (): Promise<boolean> => {
    try {
      if (documentType !== 'estimate' || !existingDocument?.id) {
        throw new Error('Can only convert estimates to invoices');
      }

      const documentData = {
        documentType: 'invoice' as const,
        documentNumber: `INV-${Date.now()}`,
        jobId,
        lineItems,
        taxRate,
        notes,
        total: calculateGrandTotal()
      };

      const invoice = await operations.convertToInvoice(existingDocument.id, documentData);
      
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }
      
      return !!invoice; // Convert to boolean
    } catch (error) {
      console.error('Error converting to invoice:', error);
      return false;
    }
  };

  // Line item management - FIXED: Proper state management
  const handleAddProduct = useCallback((product: Product) => {
    const newLineItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      taxable: true,
      discount: 0,
      ourPrice: product.cost || 0,
      name: product.name,
      price: product.price,
      total: product.price
    };

    setLineItems(prev => [...prev, newLineItem]);
    toast.success(`${product.name} added to ${documentType}`);
  }, [setLineItems, documentType]);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed");
  }, [setLineItems]);

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
  }, [setLineItems]);

  return {
    // State
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isInitialized,
    isSubmitting: operations.isSubmitting,

    // Data objects
    jobData,

    // Calculations
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,

    // Line item actions
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,

    // Document operations - Now return boolean values
    saveDocumentChanges,
    convertToInvoice,

    // Smart features
    ...smartFeatures
  };
};
