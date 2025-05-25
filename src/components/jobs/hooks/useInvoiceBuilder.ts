import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/hooks/useInvoices";
import { LineItem } from "@/components/jobs/builder/types";

interface InvoiceFormData {
  invoiceId?: string;
  jobId: string;
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
  dueDate: string;
}

interface UseInvoiceBuilderProps {
  invoiceId: string | null;
  open: boolean;
}

export const useInvoiceBuilder = ({ invoiceId, open }: UseInvoiceBuilderProps) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    jobId: '',
    invoiceNumber: `INV-${Date.now()}`,
    items: [],
    notes: "",
    status: "draft",
    total: 0,
    dueDate: new Date().toISOString().split('T')[0],
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
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

  const handleAddProduct = useCallback((product: any) => {
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
        updateFormData({
          invoiceId: invoice.id,
          jobId: invoice.job_id,
          invoiceNumber: invoice.invoice_number,
          items: lineItemsData?.map(item => ({
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            taxable: item.taxable || true
          })) || [],
          notes: invoice.notes || "",
          status: invoice.status,
          total: invoice.total || 0,
          dueDate: invoice.due_date || new Date().toISOString().split('T')[0]
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
      jobId: '',
      invoiceNumber: `INV-${Date.now()}`,
      items: [],
      notes: "",
      status: "draft",
      total: 0,
      dueDate: new Date().toISOString().split('T')[0],
    });
    setLineItems([]);
  }, []);

  const createInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: formData.jobId,
          invoice_number: formData.invoiceNumber,
          total: calculateGrandTotal(),
          status: formData.status,
          notes: formData.notes,
          due_date: formData.dueDate
        })
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
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
      
      updateFormData({ invoiceId: invoice.id });
      
      toast.success("Invoice created successfully");
      return {
        id: invoice.id,
        number: invoice.invoice_number,
        invoice_number: invoice.invoice_number,
        job_id: invoice.job_id,
        date: invoice.date || invoice.created_at,
        due_date: invoice.due_date || '',
        total: invoice.total,
        status: invoice.status,
        notes: invoice.notes || '',
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      };
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, calculateGrandTotal, updateFormData, isSubmitting]);

  const updateInvoice = useCallback(async (invoiceId: string): Promise<Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_number: formData.invoiceNumber,
          total: calculateGrandTotal(),
          status: formData.status,
          notes: formData.notes,
          due_date: formData.dueDate
        })
        .eq('id', invoiceId)
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      const { error: deleteError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_id', invoiceId)
        .eq('parent_type', 'invoice');
        
      if (deleteError) throw deleteError;
      
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
        invoice_number: invoice.invoice_number,
        job_id: invoice.job_id,
        date: invoice.date || invoice.created_at,
        due_date: invoice.due_date || '',
        total: invoice.total,
        status: invoice.status,
        notes: invoice.notes || '',
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      };
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, calculateGrandTotal, isSubmitting]);

  return {
    formData,
    lineItems,
    taxRate,
    isSubmitting,
    setLineItems,
    setTaxRate,
    updateFormData,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    createInvoice,
    updateInvoice,
    initializeFromInvoice,
    resetForm
  };
};
