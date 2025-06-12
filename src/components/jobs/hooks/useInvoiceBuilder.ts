import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem, Product } from '../builder/types';
import { Estimate } from '@/hooks/useEstimates';
import { Invoice } from '@/hooks/useInvoices';
import { generateNextId } from '@/utils/idGeneration';

interface InvoiceFormData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  terms: string;
}

export const useInvoiceBuilder = (jobId: string) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(0.1);
  const [notes, setNotes] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initializeInvoiceNumber = async () => {
      if (!invoiceNumber) {
        try {
          const newNumber = await generateNextId('invoice');
          setInvoiceNumber(newNumber);
          setFormData(prev => ({ ...prev, invoiceNumber: newNumber }));
        } catch (error) {
          console.error('Error generating invoice number:', error);
          const fallbackNumber = `INV-${Date.now()}`;
          setInvoiceNumber(fallbackNumber);
          setFormData(prev => ({ ...prev, invoiceNumber: fallbackNumber }));
        }
      }
    };

    initializeInvoiceNumber();
  }, [invoiceNumber]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return taxableAmount * taxRate;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const handleAddProduct = (product: Product) => {
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
    toast.success(`${product.name} added to invoice`);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from invoice");
  };

  const handleUpdateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        // Recalculate total when quantity or unitPrice changes
        if ('quantity' in updates || 'unitPrice' in updates) {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const saveInvoiceChanges = async () => {
    setIsSubmitting(true);
    try {
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTotalTax();
      const total = calculateGrandTotal();

      const invoiceData = {
        job_id: jobId,
        invoice_number: formData.invoiceNumber,
        total,
        subtotal,
        tax_amount: taxAmount,
        tax_rate: taxRate,
        status: 'draft' as const,
        notes: formData.notes,
        terms: formData.terms,
        items: lineItems,
        issue_date: formData.issueDate,
        due_date: formData.dueDate,
        amount_paid: 0,
        balance: total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Invoice created successfully');
      return {
        ...invoice,
        number: invoice.invoice_number,
        date: invoice.created_at,
        amount_paid: invoice.amount_paid,
        balance: invoice.balance,
        notes: invoice.notes,
        items: invoice.items,
        balance_due: invoice.balance,
        client_id: invoice.client_id,
        created_at: invoice.created_at,
        created_by: invoice.created_by,
        description: invoice.description,
        discount_amount: invoice.discount_amount,
        due_date: invoice.due_date,
        estimate_id: invoice.estimate_id,
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        job_id: invoice.job_id,
        paid_at: invoice.paid_at,
        sent_at: invoice.sent_at,
        status: invoice.status as "draft" | "sent" | "paid" | "overdue" | "partial" | "unpaid" | "cancelled",
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        tax_rate: invoice.tax_rate,
        terms: invoice.terms,
        title: invoice.title,
        total: invoice.total,
        updated_at: invoice.updated_at
      } as Invoice;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const initializeFromEstimate = (estimate: Estimate) => {
    setLineItems(Array.isArray(estimate.items) ? estimate.items : []);
    setTaxRate(estimate.tax_rate || 0.1);
    setNotes(estimate.notes || '');
    setFormData(prev => ({
      ...prev,
      notes: estimate.notes || ''
    }));
  };

  const initializeFromInvoice = (invoice: Invoice) => {
    setLineItems(Array.isArray(invoice.items) ? invoice.items : []);
    setTaxRate(invoice.tax_rate || 0.1);
    setNotes(invoice.notes || '');
    setInvoiceNumber(invoice.invoice_number);
    setFormData({
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date || new Date().toISOString().split('T')[0],
      dueDate: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: invoice.notes || '',
      terms: invoice.terms || ''
    });
  };

  const resetForm = () => {
    setLineItems([]);
    setTaxRate(0.1);
    setNotes('');
    setFormData({
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: ''
    });
  };

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
    setFormData,
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
