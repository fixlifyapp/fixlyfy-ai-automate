
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback((updates: Partial<InvoiceFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate total when items change
      if (updates.items) {
        updated.total = updates.items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          return sum + (item.taxable ? itemTotal * 1.13 : itemTotal); // 13% tax
        }, 0);
      }
      
      return updated;
    });
  }, []);

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Get estimate line items
    const getEstimateItems = async () => {
      try {
        const { data: lineItems, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');
          
        if (error) throw error;
        
        const items = lineItems?.map(item => ({
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true
        })) || [];
        
        updateFormData({
          invoiceNumber,
          items,
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
        const { data: lineItems, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');
          
        if (error) throw error;
        
        const items = lineItems?.map(item => ({
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true
        })) || [];
        
        updateFormData({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          issueDate: new Date(invoice.date).toISOString().split('T')[0],
          items,
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
  }, []);

  const createInvoice = useCallback(async (): Promise<Invoice | null> => {
    setIsSubmitting(true);
    
    try {
      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId,
          invoice_number: formData.invoiceNumber,
          total: formData.total,
          balance: formData.total,
          amount_paid: 0,
          status: formData.status,
          notes: formData.notes,
          date: formData.issueDate
        })
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Create line items
      if (formData.items.length > 0) {
        const lineItems = formData.items.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItems);
          
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
        due_date: invoice.date, // Using same date for now
        total: invoice.total,
        status: invoice.status
      };
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, updateFormData]);

  const updateInvoice = useCallback(async (invoiceId: string): Promise<Invoice | null> => {
    setIsSubmitting(true);
    
    try {
      // Update the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_number: formData.invoiceNumber,
          total: formData.total,
          balance: formData.total,
          status: formData.status,
          notes: formData.notes,
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
      if (formData.items.length > 0) {
        const lineItems = formData.items.map(item => ({
          parent_id: invoiceId,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItems);
          
        if (lineItemsError) throw lineItemsError;
      }
      
      toast.success("Invoice updated successfully");
      return {
        id: invoice.id,
        number: invoice.invoice_number,
        job_id: invoice.job_id,
        date: invoice.date,
        due_date: invoice.date,
        total: invoice.total,
        status: invoice.status
      };
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

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
          amount_paid: formData.total >= amount ? amount : formData.total,
          balance: Math.max(0, formData.total - amount),
          status: formData.total <= amount ? 'paid' : 'partial'
        })
        .eq('id', invoiceId);
        
      if (updateError) throw updateError;
      
      toast.success("Payment recorded successfully");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
      throw error;
    }
  }, [formData.total]);

  return {
    formData,
    isSubmitting,
    updateFormData,
    createInvoice,
    updateInvoice,
    recordPayment,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  };
};
