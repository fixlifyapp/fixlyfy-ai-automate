import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineItem, Product } from "@/components/jobs/builder/types";

export interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  date: string;
  due_date?: string;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  amount_paid?: number;
  balance?: number;
}

export const useInvoiceBuilder = (
  jobId: string,
  invoiceId?: string | null,
  onClose?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  };

  // Load existing invoice if editing
  useEffect(() => {
    if (invoiceId) {
      loadInvoice(invoiceId);
    }
  }, [invoiceId]);

  const loadInvoice = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
        
      if (invoiceError) throw invoiceError;
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', id)
        .eq('parent_type', 'invoice');
        
      if (itemsError) throw itemsError;
      
      setInvoice(invoiceData);
      setNotes(invoiceData.notes || "");
      if (invoiceData.due_date) {
        setDueDate(new Date(invoiceData.due_date));
      }
      
      const transformedItems: LineItem[] = itemsData?.map(item => ({
        id: item.id,
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unit_price || 0),
        taxable: item.taxable !== false,
        total: (item.quantity || 1) * Number(item.unit_price || 0)
      })) || [];
      
      setLineItems(transformedItems);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const saveInvoice = async () => {
    try {
      setIsLoading(true);
      
      const total = lineItems.reduce((sum, item) => sum + item.total, 0);
      const invoiceNumber = invoice?.invoice_number || generateInvoiceNumber();
      
      let savedInvoice: Invoice;
      
      if (invoiceId) {
        // Update existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .update({
            total,
            balance: total - (invoice?.amount_paid || 0),
            notes,
            due_date: dueDate?.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
          .select()
          .single();
          
        if (error) throw error;
        savedInvoice = data;
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert({
            job_id: jobId,
            invoice_number: invoiceNumber,
            total,
            balance: total,
            status: 'unpaid',
            notes,
            due_date: dueDate?.toISOString(),
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        savedInvoice = data;
      }
      
      // Save line items
      if (lineItems.length > 0) {
        if (invoiceId) {
          await supabase
            .from('line_items')
            .delete()
            .eq('parent_id', invoiceId)
            .eq('parent_type', 'invoice');
        }
        
        const lineItemsToInsert = lineItems.map(item => ({
          parent_id: savedInvoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        await supabase
          .from('line_items')
          .insert(lineItemsToInsert);
      }
      
      toast.success(`Invoice ${invoiceNumber} saved successfully`);
      
      if (onClose) onClose();
      
      return savedInvoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addLineItem = (item: LineItem) => {
    setLineItems(prev => [...prev, { ...item, id: `temp-${Date.now()}` }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  return {
    isLoading,
    invoice,
    lineItems,
    notes,
    dueDate,
    setNotes,
    setDueDate,
    addLineItem,
    removeLineItem,
    updateLineItem,
    saveInvoice,
    calculateTotal
  };
};
