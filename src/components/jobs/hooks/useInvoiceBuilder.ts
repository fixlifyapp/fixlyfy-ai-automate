
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem, lineItemsToJson } from '../builder/types';
import { Estimate } from '@/hooks/useEstimates';
import { Invoice } from '@/hooks/useInvoices';

interface InvoiceFormData {
  invoiceNumber: string;
  dueDate: string;
  terms: string;
  notes: string;
}

export const useInvoiceBuilder = (jobId: string) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    dueDate: '',
    terms: '',
    notes: ''
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(0.08);
  const [notes, setNotes] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with empty line item
  useEffect(() => {
    if (lineItems.length === 0) {
      setLineItems([{
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxable: true,
        ourPrice: 0,
        name: '',
        price: 0,
        discount: 0
      }]);
    }
  }, [lineItems.length]);

  const handleAddProduct = useCallback((product: any) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.name || product.description || '',
      quantity: 1,
      unitPrice: product.price || 0,
      total: product.price || 0,
      taxable: product.taxable !== undefined ? product.taxable : true,
      ourPrice: product.cost || product.ourprice || product.our_price || 0,
      name: product.name,
      price: product.price || 0,
      discount: 0
    };
    setLineItems(prev => [...prev, newItem]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if ('quantity' in updates || 'unitPrice' in updates) {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  }, []);

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

  const saveInvoiceChanges = async () => {
    setIsSubmitting(true);
    try {
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTotalTax();
      const total = calculateGrandTotal();

      const invoiceData = {
        job_id: jobId,
        invoice_number: invoiceNumber,
        total,
        subtotal,
        tax_amount: taxAmount,
        tax_rate: taxRate,
        status: 'draft' as const,
        notes,
        terms: formData.terms,
        items: lineItemsToJson(lineItems) as any,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: formData.dueDate || null,
        amount_paid: 0,
        balance_due: total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Invoice saved successfully');
      return invoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      invoiceNumber: '',
      dueDate: '',
      terms: '',
      notes: ''
    });
    setLineItems([{
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxable: true,
      ourPrice: 0,
      name: '',
      price: 0,
      discount: 0
    }]);
    setTaxRate(0.08);
    setNotes('');
    setInvoiceNumber('');
  }, []);

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
    setInvoiceNumber(`INV-${Date.now()}`);
    setNotes(estimate.notes || '');
    setTaxRate(estimate.tax_rate || 0.08);
    
    // Convert estimate items to line items
    if (estimate.items && Array.isArray(estimate.items)) {
      const items = estimate.items.map((item: any, index: number) => ({
        id: item.id || `item-${Date.now()}-${index}`,
        description: item.description || item.name || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice || item.price) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unitPrice || item.price) || 0),
        taxable: item.taxable !== undefined ? item.taxable : true,
        ourPrice: Number(item.ourPrice || item.cost) || 0,
        name: item.name || item.description,
        price: Number(item.price || item.unitPrice) || 0,
        discount: Number(item.discount) || 0
      }));
      setLineItems(items);
    }
  }, []);

  const initializeFromInvoice = useCallback((invoice: Invoice) => {
    setInvoiceNumber(invoice.invoice_number);
    setNotes(invoice.notes || '');
    setTaxRate(invoice.tax_rate || 0.08);
    setFormData({
      invoiceNumber: invoice.invoice_number,
      dueDate: invoice.due_date || '',
      terms: invoice.terms || '',
      notes: invoice.notes || ''
    });
    
    // Convert invoice items to line items
    if (invoice.items && Array.isArray(invoice.items)) {
      const items = invoice.items.map((item: any, index: number) => ({
        id: item.id || `item-${Date.now()}-${index}`,
        description: item.description || item.name || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice || item.price) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unitPrice || item.price) || 0),
        taxable: item.taxable !== undefined ? item.taxable : true,
        ourPrice: Number(item.ourPrice || item.cost) || 0,
        name: item.name || item.description,
        price: Number(item.price || item.unitPrice) || 0,
        discount: Number(item.discount) || 0
      }));
      setLineItems(items);
    }
  }, []);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    invoiceNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    setInvoiceNumber,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  };
};
