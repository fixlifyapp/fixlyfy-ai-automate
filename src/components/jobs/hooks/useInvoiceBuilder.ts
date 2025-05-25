
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product, LineItem } from "@/components/jobs/builder/types";

interface InvoiceFormData {
  invoiceId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
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

export const useInvoiceBuilder = (jobId: string) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const updateFormData = useCallback((updates: Partial<InvoiceFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate total when items change
      if (updates.items) {
        updated.total = updates.items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          return sum + (item.taxable ? itemTotal * (1 + taxRate / 100) : itemTotal);
        }, 0);
      }
      
      return updated;
    });
  }, [taxRate]);

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

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Get estimate line items
    const getEstimateItems = async () => {
      try {
        const { data: lineItemsData, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');
          
        if (error) throw error;
        
        const items = lineItemsData?.map((item, index) => ({
          id: item.id || `item-${index}`,
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true,
          discount: 0,
          ourPrice: 0,
          name: item.description || "",
          price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0)
        })) || [];
        
        setLineItems(items);
        setNotes(estimate.notes || "");
        updateFormData({
          invoiceNumber,
          items: lineItemsData?.map(item => ({
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            taxable: item.taxable || true
          })) || [],
          notes: estimate.notes || "",
          total: estimate.total || 0
        });
      } catch (error) {
        console.error("Error loading estimate items:", error);
        toast.error("Failed to load estimate items");
      }
    };
    
    getEstimateItems();
  }, [updateFormData]);

  const initializeFromInvoice = useCallback((invoice: Invoice) => {
    const getInvoiceItems = async () => {
      try {
        const { data: lineItemsData, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');
          
        if (error) throw error;
        
        const items = lineItemsData?.map((item, index) => ({
          id: item.id || `item-${index}`,
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true,
          discount: 0,
          ourPrice: 0,
          name: item.description || "",
          price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0)
        })) || [];
        
        setLineItems(items);
        setNotes(invoice.notes || "");
        updateFormData({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          issueDate: new Date(invoice.date).toISOString().split('T')[0],
          items: lineItemsData?.map(item => ({
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            taxable: item.taxable || true
          })) || [],
          notes: invoice.notes || "",
          status: invoice.status,
          total: invoice.total || 0
        });
      } catch (error) {
        console.error("Error loading invoice items:", error);
        toast.error("Failed to load invoice items");
      }
    };
    
    getInvoiceItems();
  }, [updateFormData]);

  const resetForm = useCallback(() => {
    setFormData({
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      notes: "",
      status: "draft",
      total: 0
    });
    setLineItems([]);
    setNotes("");
  }, []);

  const createInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId,
          invoice_number: formData.invoiceNumber,
          total: calculateGrandTotal(),
          balance: calculateGrandTotal(),
          amount_paid: 0,
          status: formData.status,
          notes: notes,
          date: formData.issueDate
        })
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Create line items from lineItems state
      if (lineItems.length > 0) {
        const lineItemsData = lineItems.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItemsData);
          
        if (lineItemsError) throw lineItemsError;
      }
      
      // Update form data with the created invoice ID
      updateFormData({ invoiceId: invoice.id });
      
      toast.success("Invoice created successfully");
      return {
        id: invoice.id,
        number: invoice.invoice_number,
        job_id: invoice.job_id,
        date: invoice.date,
        due_date: formData.dueDate,
        total: invoice.total,
        status: invoice.status,
        notes: invoice.notes
      };
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, lineItems, notes, calculateGrandTotal, updateFormData, isSubmitting]);

  const updateInvoice = useCallback(async (invoiceId: string): Promise<Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      // Update the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_number: formData.invoiceNumber,
          total: calculateGrandTotal(),
          balance: calculateGrandTotal(),
          status: formData.status,
          notes: notes,
          date: formData.issueDate
        })
        .eq('id', invoiceId)
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_id', invoiceId)
        .eq('parent_type', 'invoice');
        
      if (deleteError) throw deleteError;
      
      // Create new line items
      if (lineItems.length > 0) {
        const lineItemsData = lineItems.map(item => ({
          parent_id: invoiceId,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItemsData);
          
        if (lineItemsError) throw lineItemsError;
      }
      
      toast.success("Invoice updated successfully");
      return {
        id: invoice.id,
        number: invoice.invoice_number,
        job_id: invoice.job_id,
        date: invoice.date,
        due_date: formData.dueDate,
        total: invoice.total,
        status: invoice.status,
        notes: invoice.notes
      };
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  const sendInvoice = useCallback(async (
    invoiceId: string,
    recipient: string,
    method: 'email' | 'sms',
    customMessage?: string
  ) => {
    if (isSending) {
      toast.error("Invoice is already being sent");
      return false;
    }
    
    setIsSending(true);
    
    toast.info(`Sending invoice via ${method}...`, {
      duration: 2000
    });
    
    try {
      // Get invoice details
      const { data: invoiceDetails, error: invoiceError } = await supabase
        .from('invoice_details_view')
        .select('*')
        .eq('invoice_id', invoiceId)
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Create communication record
      const communicationData = {
        invoice_id: invoiceId,
        communication_type: method,
        recipient,
        subject: method === 'email' ? `Invoice ${invoiceDetails.invoice_number}` : null,
        content: customMessage || `Your invoice ${invoiceDetails.invoice_number} is ready for payment.`,
        status: 'pending',
        invoice_number: invoiceDetails.invoice_number,
        client_name: invoiceDetails.client_name,
        client_email: invoiceDetails.client_email,
        client_phone: invoiceDetails.client_phone
      };
      
      const { error: commError } = await supabase
        .from('invoice_communications')
        .insert(communicationData);
        
      if (commError) throw commError;
      
      toast.success(`Invoice sent successfully via ${method}!`);
      return true;
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error(`Failed to send invoice via ${method}`);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  const recordPayment = useCallback(async (
    invoiceId: string, 
    amount: number, 
    method: string, 
    reference?: string, 
    notes?: string
  ) => {
    try {
      // Record the payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          amount,
          method,
          reference: reference || "",
          notes: notes || "",
          date: new Date().toISOString()
        });
        
      if (paymentError) throw paymentError;
      
      // Update invoice balance
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: calculateGrandTotal() >= amount ? amount : calculateGrandTotal(),
          balance: Math.max(0, calculateGrandTotal() - amount),
          status: calculateGrandTotal() <= amount ? 'paid' : 'partial'
        })
        .eq('id', invoiceId);
        
      if (updateError) throw updateError;
      
      toast.success("Payment recorded successfully");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
      throw error;
    }
  }, [calculateGrandTotal]);

  const saveInvoiceChanges = useCallback(async () => {
    if (formData.invoiceId) {
      return await updateInvoice(formData.invoiceId);
    } else {
      return await createInvoice();
    }
  }, [formData.invoiceId, updateInvoice, createInvoice]);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    invoiceNumber: formData.invoiceNumber,
    issueDate: formData.issueDate,
    dueDate: formData.dueDate,
    isSubmitting,
    isSending,
    setLineItems,
    setTaxRate,
    setNotes,
    updateFormData,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    createInvoice,
    updateInvoice,
    sendInvoice,
    recordPayment,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  };
};
