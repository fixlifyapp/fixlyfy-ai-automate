
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
    try {
      setIsLoading(true);
      let query = supabase.from('estimates').select('*').order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setEstimates(data || []);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const convertEstimateToInvoice = async (estimateId: string): Promise<boolean> => {
    try {
      // Get the estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) throw estimateError;

      // Get line items for the estimate
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');

      if (lineItemsError) throw lineItemsError;

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          estimate_id: estimateId,
          invoice_number: invoiceNumber,
          total: estimate.total,
          status: 'unpaid',
          notes: estimate.notes,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

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

        if (lineItemError) throw lineItemError;
      }

      // Update estimate status
      await supabase
        .from('estimates')
        .update({ status: 'accepted' })
        .eq('id', estimateId);

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
    refreshEstimates();
  }, [jobId]);

  return {
    estimates,
    setEstimates,
    isLoading,
    refreshEstimates,
    convertEstimateToInvoice
  };
};
