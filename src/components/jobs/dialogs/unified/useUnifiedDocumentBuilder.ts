
import { useState, useEffect, useCallback } from 'react';
import { LineItem } from '../../builder/types';
import { Estimate } from '@/hooks/useEstimates';
import { Invoice } from '@/hooks/useInvoices';
import { toast } from 'sonner';

export type DocumentType = "estimate" | "invoice";

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
  const [taxRate, setTaxRate] = useState(0.08);
  const [notes, setNotes] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock job data
  const jobData = {
    id: jobId,
    title: 'HVAC Maintenance Service',
    client: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567'
    },
    address: '123 Main St, Anytown, USA'
  };

  // Initialize document
  useEffect(() => {
    if (open) {
      const initializeDocument = async () => {
        try {
          if (existingDocument) {
            // Load existing document
            setLineItems(existingDocument.items || []);
            setTaxRate(existingDocument.tax_rate || 0.08);
            setNotes(existingDocument.notes || '');
            
            // Handle different document types with type safety
            if (documentType === 'estimate' && 'estimate_number' in existingDocument) {
              setDocumentNumber(existingDocument.estimate_number || '');
            } else if (documentType === 'invoice' && 'invoice_number' in existingDocument) {
              setDocumentNumber(existingDocument.invoice_number || '');
            }
          } else {
            // Create new document
            const prefix = documentType === 'estimate' ? 'EST' : 'INV';
            const number = `${prefix}-${Date.now().toString().slice(-6)}`;
            setDocumentNumber(number);
            setLineItems([]);
            setTaxRate(0.08);
            setNotes('');
          }
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing document:', error);
          toast.error('Failed to initialize document');
        }
      };

      initializeDocument();
    }
  }, [open, existingDocument, documentType]);

  // Calculations
  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const calculateTotalTax = useCallback(() => {
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return taxableAmount * taxRate;
  }, [lineItems, taxRate]);

  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  // Line item actions
  const handleAddProduct = useCallback((product: any) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      total: product.price,
      taxable: true,
      ourPrice: product.cost || product.ourprice || 0,
      name: product.name,
      price: product.price,
      discount: 0
    };
    setLineItems(prev => [...prev, newItem]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  }, []);

  // Document operations
  const saveDocumentChanges = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving document:', {
        documentType,
        documentNumber,
        jobId,
        lineItems,
        taxRate,
        notes,
        total: calculateGrandTotal()
      });
      
      toast.success(`${documentType} saved successfully`);
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(`Failed to save ${documentType}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [documentType, documentNumber, jobId, lineItems, taxRate, notes, calculateGrandTotal]);

  const convertToInvoice = useCallback(async () => {
    if (documentType !== 'estimate') return false;
    
    setIsSubmitting(true);
    try {
      // Simulate conversion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Estimate converted to invoice successfully');
      onSyncToInvoice?.();
      return true;
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert to invoice');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [documentType, onSyncToInvoice]);

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
    isSubmitting,

    // Data objects
    jobData,

    // Calculations
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,

    // Line item actions
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,

    // Document operations
    saveDocumentChanges,
    convertToInvoice
  };
};
