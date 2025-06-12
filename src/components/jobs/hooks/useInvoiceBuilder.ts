
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem, Product } from '../builder/types';
import { Invoice } from '@/hooks/useInvoices';
import { Estimate } from '@/hooks/useEstimates';

interface InvoiceFormData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export const useInvoiceBuilder = (jobId: string) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    lineItems: [],
    notes: '',
    taxRate: 0.1,
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate invoice number on mount
  useEffect(() => {
    if (!formData.invoiceNumber) {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: `INV-${Date.now()}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
  }, [formData.invoiceNumber]);

  const addProduct = (product: Product): LineItem => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      taxable: product.taxable ?? true,
      total: product.price,
      ourPrice: product.ourprice || 0,
      name: product.name,
      price: product.price
    };

    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newLineItem]
    }));

    return newLineItem;
  };

  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
              total: updates.quantity !== undefined || updates.unitPrice !== undefined
                ? (updates.quantity ?? item.quantity) * (updates.unitPrice ?? item.unitPrice)
                : item.total
            }
          : item
      )
    }));
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotalTax = () => {
    const taxableAmount = formData.lineItems.reduce((sum, item) => {
      return sum + (item.taxable ? item.total : 0);
    }, 0);
    return taxableAmount * formData.taxRate;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const saveInvoiceChanges = async (): Promise<Invoice | null> => {
    if (formData.lineItems.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return null;
    }

    setIsSubmitting(true);
    try {
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTotalTax();
      const total = calculateGrandTotal();

      const invoiceData = {
        job_id: jobId,
        invoice_number: formData.invoiceNumber,
        issue_date: formData.issueDate,
        due_date: formData.dueDate || null,
        items: formData.lineItems,
        notes: formData.notes,
        tax_rate: formData.taxRate,
        subtotal,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        balance: total,
        status: 'draft'
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Invoice saved successfully');
      return {
        ...invoice,
        number: invoice.invoice_number,
        date: invoice.issue_date || invoice.created_at,
        amount_paid: invoice.amount_paid || 0,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        notes: invoice.notes || '',
        items: Array.isArray(invoice.items) ? invoice.items : []
      };
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice: ' + error.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [],
      notes: '',
      taxRate: 0.1,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    });
  };

  const initializeFromEstimate = (estimate: Estimate) => {
    const lineItems: LineItem[] = Array.isArray(estimate.items) 
      ? estimate.items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          description: item.description || item.name || 'Service Item',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice || item.price || item.unit_price) || 0,
          taxable: item.taxable !== undefined ? item.taxable : true,
          total: Number(item.total || (item.quantity * (item.unitPrice || item.price || item.unit_price))) || 0,
          ourPrice: Number(item.ourprice || item.ourPrice || item.cost || 0),
          name: item.name || item.description || 'Service Item',
          price: Number(item.unitPrice || item.price || item.unit_price) || 0
        }))
      : [];

    setFormData({
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems,
      notes: estimate.notes || '',
      taxRate: 0.1,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    });
  };

  const initializeFromInvoice = (invoice: Invoice) => {
    const lineItems: LineItem[] = Array.isArray(invoice.items) 
      ? invoice.items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          description: item.description || item.name || 'Service Item',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice || item.price || item.unit_price) || 0,
          taxable: item.taxable !== undefined ? item.taxable : true,
          total: Number(item.total || (item.quantity * (item.unitPrice || item.price || item.unit_price))) || 0,
          ourPrice: Number(item.ourprice || item.ourPrice || item.cost || 0),
          name: item.name || item.description || 'Service Item',
          price: Number(item.unitPrice || item.price || item.unit_price) || 0
        }))
      : [];

    setFormData({
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date || invoice.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      dueDate: invoice.due_date || '',
      lineItems,
      notes: invoice.notes || '',
      taxRate: 0.1,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    });
  };

  // Computed values for easier access
  const lineItems = formData.lineItems;
  const taxRate = formData.taxRate;
  const notes = formData.notes;
  const invoiceNumber = formData.invoiceNumber;

  const setLineItems = (items: LineItem[]) => {
    setFormData(prev => ({ ...prev, lineItems: items }));
  };

  const setTaxRate = (rate: number) => {
    setFormData(prev => ({ ...prev, taxRate: rate }));
  };

  const setNotes = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
  };

  const handleAddProduct = addProduct;
  const handleRemoveLineItem = removeLineItem;
  const handleUpdateLineItem = updateLineItem;

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
