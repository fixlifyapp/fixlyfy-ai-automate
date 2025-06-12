import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Estimate {
  id: string;
  job_id: string;
  estimate_number: string;
  number: string; // alias for estimate_number
  date: string;
  total: number;
  amount: number; // alias for total
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  valid_until?: string; // Added this field
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
    total: number;
    name?: string;
    price?: number;
  }>;
  viewed?: boolean;
  techniciansNote?: string;
}

export const useEstimates = (jobId?: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshEstimates = async () => {
    console.log('Refreshing estimates for job:', jobId);
    try {
      setIsLoading(true);
      let query = supabase.from('estimates').select('*').order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching estimates:', error);
        throw error;
      }
      
      console.log('Fetched estimates:', data);
      
      // Map the data to include the alias properties
      const mappedData = (data || []).map(item => ({
        ...item,
        number: item.estimate_number || `EST-${item.id.slice(0, 8)}`, // Add alias with fallback
        amount: item.total || 0, // Add alias
        date: item.created_at, // Use created_at as date
        estimate_number: item.estimate_number || `EST-${item.id.slice(0, 8)}`, // Ensure estimate_number exists
        valid_until: item.valid_until || undefined, // Handle valid_until properly
      }));
      
      setEstimates(mappedData);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const convertEstimateToInvoice = async (estimateId: string): Promise<boolean> => {
    console.log('Converting estimate to invoice:', estimateId);
    try {
      // Get the estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) {
        console.error('Error fetching estimate:', estimateError);
        throw estimateError;
      }

      console.log('Found estimate for conversion:', estimate);

      // Get line items for the estimate
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');

      if (lineItemsError) {
        console.error('Error fetching line items:', lineItemsError);
        throw lineItemsError;
      }

      console.log('Found line items:', lineItems);

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          estimate_id: estimateId,
          invoice_number: invoiceNumber,
          total: estimate.total || 0,
          amount_paid: 0,
          status: 'unpaid',
          notes: estimate.notes,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        throw invoiceError;
      }

      console.log('Created invoice:', invoice);

      // Copy line items to invoice
      if (lineItems && lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable
        }));

        const { error: lineItemError } = await supabase
          .from('line_items')
          .insert(invoiceLineItems);

        if (lineItemError) {
          console.error('Error copying line items:', lineItemError);
          throw lineItemError;
        }

        console.log('Copied line items to invoice');
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);

      if (updateError) {
        console.error('Error updating estimate status:', updateError);
        throw updateError;
      }

      console.log('Updated estimate status to converted');

      toast.success('Estimate converted to invoice successfully');
      await refreshEstimates();
      return true;
    } catch (error: any) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
      return false;
    }
  };

  useEffect(() => {
    if (jobId) {
      refreshEstimates();
    }
  }, [jobId]);

  return {
    estimates,
    setEstimates,
    isLoading,
    refreshEstimates,
    convertEstimateToInvoice
  };
};
