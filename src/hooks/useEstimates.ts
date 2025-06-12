
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
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
  notes?: string;
  created_at: string;
  updated_at: string;
  valid_until?: string;
  items?: any[]; // JSON array from database
  viewed?: boolean;
  techniciansNote?: string;
  tax_rate?: number;
  tax_amount?: number;
  subtotal?: number;
  discount_amount?: number;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  created_by?: string;
  sent_at?: string;
  approved_at?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export const useEstimates = (jobId?: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshEstimates = async () => {
    console.log('Refreshing estimates for job:', jobId);
    try {
      setIsLoading(true);
      let query = supabase
        .from('estimates')
        .select(`
          *,
          clients:client_id (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching estimates:', error);
        throw error;
      }
      
      console.log('Fetched estimates:', data);
      
      // Map the data to include the alias properties and client information
      const mappedData: Estimate[] = (data || []).map(item => ({
        ...item,
        number: item.estimate_number || `EST-${item.id.slice(0, 8)}`,
        amount: item.total || 0,
        date: item.created_at,
        estimate_number: item.estimate_number || `EST-${item.id.slice(0, 8)}`,
        valid_until: item.valid_until || undefined,
        items: Array.isArray(item.items) ? item.items : [],
        status: item.status as 'draft' | 'sent' | 'approved' | 'rejected' | 'converted',
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        subtotal: item.subtotal || 0,
        discount_amount: item.discount_amount || 0,
        client_name: item.clients?.name || 'Unknown Client',
        client_email: item.clients?.email,
        client_phone: item.clients?.phone,
        client: item.clients ? {
          id: item.clients.id,
          name: item.clients.name,
          email: item.clients.email,
          phone: item.clients.phone
        } : undefined
      }));
      
      setEstimates(mappedData);
    } catch (error: any) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEstimatesWithJobs = async () => {
    return refreshEstimates();
  };

  const updateEstimateStatus = async (estimateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ status: newStatus })
        .eq('id', estimateId);

      if (error) throw error;
      await refreshEstimates();
      return true;
    } catch (error) {
      console.error('Error updating estimate status:', error);
      return false;
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
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: estimate.items || []
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        throw invoiceError;
      }

      console.log('Created invoice:', invoice);

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
    fetchEstimatesWithJobs: refreshEstimates,
    updateEstimateStatus,
    convertEstimateToInvoice
  };
};
