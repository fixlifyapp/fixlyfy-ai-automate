
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";

interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
  created_at?: string;
}

interface Invoice {
  id: string;
  number: string;
  job_id: string;
  client_id: string;
  estimate_id?: string;
  date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export const useInvoices = (jobId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { actions: { generateUniqueNumber } } = useEstimateInfo();

  const fetchInvoices = async () => {
    if (!jobId) return;

    setIsLoading(true);
    try {
      // First get invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      
      if (!invoicesData) {
        setInvoices([]);
        return;
      }

      // Then get items for each invoice
      const invoicesWithItems = await Promise.all(
        invoicesData.map(async (invoice) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);

          if (itemsError) throw itemsError;

          return {
            ...invoice,
            items: itemsData || []
          };
        })
      );

      setInvoices(invoicesWithItems);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createInvoiceFromEstimate = async (estimateId: string) => {
    try {
      // First get the estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*, estimate_items(*)')
        .eq('id', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      if (!estimate) throw new Error('Estimate not found');
      
      // Get job info to ensure we have client_id
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('client_id')
        .eq('id', estimate.job_id)
        .single();
        
      if (jobError) throw jobError;
      if (!job) throw new Error('Job not found');
      
      // Create a new invoice number
      const invoiceNumber = generateUniqueNumber('INV');
      
      // Calculate totals
      const items = estimate.estimate_items || [];
      const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const taxAmount = items.reduce((total, item) => {
        const itemSubtotal = item.price * item.quantity;
        return total + (item.taxable ? itemSubtotal * 0.1 : 0); // Assuming 10% tax rate
      }, 0);
      const total = subtotal + taxAmount;
      
      // Set due date 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          number: invoiceNumber,
          job_id: estimate.job_id,
          client_id: job.client_id,
          estimate_id: estimate.id,
          date: new Date().toISOString(),
          due_date: dueDate.toISOString(),
          subtotal,
          tax_amount: taxAmount,
          total,
          status: 'draft',
          notes: estimate.technicians_note || undefined
        })
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        description: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        discount: 0, // Assuming no discount - could be added as a field to estimate_items
        tax: item.taxable ? 10 : 0, // Again assuming 10% tax
        total: item.price * item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);
        
      if (itemsError) throw itemsError;
      
      // Update estimate status to converted
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);
        
      if (updateError) throw updateError;
      
      toast.success(`Invoice ${invoiceNumber} created successfully from estimate`);
      
      // Refresh the invoices list
      setRefreshTrigger(prev => prev + 1);
      
      return invoice;
    } catch (error) {
      console.error('Error creating invoice from estimate:', error);
      toast.error('Failed to create invoice from estimate');
      return null;
    }
  };
  
  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);
        
      if (error) throw error;
      
      // Update local state
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status } : inv
      ));
      
      toast.success(`Invoice status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
      return false;
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchInvoices();
    }
  }, [jobId, refreshTrigger]);

  return {
    invoices,
    isLoading,
    createInvoiceFromEstimate,
    updateInvoiceStatus,
    refreshInvoices: () => setRefreshTrigger(prev => prev + 1)
  };
};
