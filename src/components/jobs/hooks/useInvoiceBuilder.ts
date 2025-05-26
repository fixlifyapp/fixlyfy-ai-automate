
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product, LineItem } from "@/components/jobs/builder/types";

interface InvoiceFormData {
  invoiceId?: string;
  invoiceNumber: string;
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

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
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
      } catch (error) {
        console.error("Error loading estimate items:", error);
        toast.error("Failed to load estimate items");
      }
    };
    
    getEstimateItems();
  }, []);

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
        setFormData(prev => ({
          ...prev,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          status: invoice.status,
          total: invoice.total
        }));
      } catch (error) {
        console.error("Error loading invoice items:", error);
        toast.error("Failed to load invoice items");
      }
    };
    
    getInvoiceItems();
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      invoiceNumber: `INV-${Date.now()}`,
      items: [],
      notes: "",
      status: "draft",
      total: 0
    });
    setLineItems([]);
    setNotes("");
  }, []);

  const saveInvoiceChanges = useCallback(async (): Promise<Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      const invoiceData = {
        job_id: jobId,
        invoice_number: formData.invoiceNumber,
        total: calculateGrandTotal(),
        status: formData.status,
        notes: notes
      };

      let invoice;
      if (formData.invoiceId) {
        // Update existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', formData.invoiceId)
          .select()
          .single();
          
        if (error) throw error;
        invoice = data;
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
          
        if (error) throw error;
        invoice = data;
      }
      
      // Handle line items
      if (invoice) {
        // Delete existing line items
        await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');
        
        // Create new line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            parent_id: invoice.id,
            parent_type: 'invoice',
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
      
      toast.success(formData.invoiceId ? "Invoice updated successfully" : "Invoice created successfully");
      
      return {
        id: invoice.id,
        job_id: invoice.job_id,
        invoice_number: invoice.invoice_number,
        number: invoice.invoice_number,
        date: invoice.date || invoice.created_at,
        total: invoice.total,
        amount_paid: invoice.amount_paid || 0,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        status: invoice.status,
        notes: invoice.notes,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      };
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    invoiceNumber: formData.invoiceNumber,
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
