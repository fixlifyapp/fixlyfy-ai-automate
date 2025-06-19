
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Estimate } from "@/types/documents";

export const useEstimates = (jobId: string) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEstimates = async () => {
    if (!jobId) return;

    try {
      console.log('📊 Fetching estimates for job:', jobId);
      
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching estimates:', error);
        toast.error('Failed to load estimates');
        return;
      }

      console.log('✅ Estimates fetched:', data?.length || 0);
      setEstimates(data || []);
    } catch (error) {
      console.error('❌ Error in fetchEstimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const convertEstimateToInvoice = async (estimateId: string): Promise<boolean> => {
    try {
      console.log('🔄 Converting estimate to invoice:', estimateId);

      const estimate = estimates.find(e => e.id === estimateId);
      if (!estimate) {
        toast.error('Estimate not found');
        return false;
      }

      // Generate invoice number
      const { data: invoiceNumber, error: idError } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'invoice'
      });

      if (idError) {
        console.error('❌ Error generating invoice number:', idError);
        toast.error('Failed to generate invoice number');
        return false;
      }

      // Create invoice from estimate
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          client_id: estimate.client_id,
          estimate_id: estimate.id,
          invoice_number: invoiceNumber,
          items: estimate.items,
          subtotal: estimate.subtotal,
          tax_rate: estimate.tax_rate,
          tax_amount: estimate.tax_amount,
          discount_amount: estimate.discount_amount,
          total: estimate.total,
          notes: estimate.notes,
          terms: estimate.terms,
          status: 'draft',
          payment_status: 'unpaid',
          amount_paid: 0,
          issue_date: new Date().toISOString().split('T')[0]
        });

      if (invoiceError) {
        console.error('❌ Error creating invoice:', invoiceError);
        toast.error('Failed to create invoice');
        return false;
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);

      if (updateError) {
        console.error('❌ Error updating estimate status:', updateError);
        toast.error('Failed to update estimate status');
        return false;
      }

      console.log('✅ Estimate converted to invoice successfully');
      toast.success('Estimate converted to invoice successfully');
      
      // Refresh estimates
      await fetchEstimates();
      
      return true;
    } catch (error) {
      console.error('❌ Error converting estimate:', error);
      toast.error('Failed to convert estimate');
      return false;
    }
  };

  const refreshEstimates = () => {
    fetchEstimates();
  };

  useEffect(() => {
    fetchEstimates();
  }, [jobId]);

  return {
    estimates,
    isLoading,
    convertEstimateToInvoice,
    refreshEstimates
  };
};
