
import { useState, useEffect } from 'react';

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  taxable?: boolean;
}

interface UseUnifiedDocumentBuilderProps {
  documentType: 'estimate' | 'invoice';
  existingDocument?: any;
  jobId: string;
  open: boolean;
}

export const useUnifiedDocumentBuilder = ({
  documentType,
  existingDocument,
  jobId,
  open
}: UseUnifiedDocumentBuilderProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(0.13); // 13% tax rate
  const [notes, setNotes] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize document number
  useEffect(() => {
    if (open && !existingDocument && !documentNumber) {
      const prefix = documentType === 'estimate' ? 'EST' : 'INV';
      const timestamp = Date.now().toString().slice(-4);
      setDocumentNumber(`${prefix}-${timestamp}`);
    }
  }, [open, documentType, existingDocument, documentNumber]);

  // Load existing document data
  useEffect(() => {
    if (existingDocument) {
      setLineItems(existingDocument.lineItems || []);
      setTaxRate(existingDocument.taxRate || 0.13);
      setNotes(existingDocument.notes || '');
      setDocumentNumber(existingDocument.documentNumber || '');
    }
  }, [existingDocument]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    return lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice * taxRate), 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      name: product.name,
      description: product.description || '',
      quantity: 1,
      unitPrice: product.price,
      taxable: product.taxable !== false,
    };
    setLineItems(prev => [...prev, newLineItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const saveDocumentChanges = async () => {
    setIsSubmitting(true);
    try {
      // Mock save functionality - in real app this would save to Supabase
      const documentData = {
        id: existingDocument?.id || Date.now().toString(),
        documentNumber,
        type: documentType,
        lineItems,
        taxRate,
        notes,
        subtotal: calculateSubtotal(),
        tax: calculateTotalTax(),
        total: calculateGrandTotal(),
        jobId,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      
      console.log('Saving document:', documentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return documentData;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isSubmitting,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    saveDocumentChanges
  };
};
