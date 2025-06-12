
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Estimate } from '@/hooks/useEstimates';

export const useEstimateActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimatesWithJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          jobs:job_id(*)
        `);

      if (error) throw error;

      // Transform the data to match our Estimate interface
      const estimates: Estimate[] = (data || []).map(item => ({
        id: item.id,
        job_id: item.job_id,
        estimate_number: item.estimate_number,
        number: item.estimate_number,
        date: item.created_at,
        total: item.total || 0,
        amount: item.total || 0,
        status: item.status as Estimate['status'], // Cast to correct type
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        valid_until: item.valid_until,
        items: Array.isArray(item.items) ? item.items : [],
        viewed: false,
        techniciansNote: item.notes
      }));

      return estimates;
    } catch (error) {
      console.error('Error fetching estimates with jobs:', error);
      toast.error('Failed to fetch estimates');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateEstimateStatus = async (estimateId: string, status: Estimate['status']) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'approved' && { approved_at: new Date().toISOString() })
        })
        .eq('id', estimateId);

      if (error) throw error;

      toast.success(`Estimate ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating estimate status:', error);
      toast.error('Failed to update estimate status');
      return false;
    }
  };

  const convertEstimateToInvoice = async (estimateId: string) => {
    try {
      // Get the estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) throw estimateError;

      // Create invoice from estimate
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          estimate_id: estimateId,
          invoice_number: invoiceNumber,
          total: estimate.total || 0,
          subtotal: estimate.subtotal || 0,
          tax_amount: estimate.tax_amount || 0,
          tax_rate: estimate.tax_rate || 0,
          amount_paid: 0,
          balance: estimate.total || 0,
          status: 'unpaid',
          notes: estimate.notes,
          items: estimate.items || [],
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update estimate status
      await updateEstimateStatus(estimateId, 'converted');

      toast.success('Estimate converted to invoice successfully');
      return invoice;
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
      return null;
    }
  };

  const deleteEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', estimateId);

      if (error) throw error;

      toast.success('Estimate deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast.error('Failed to delete estimate');
      return false;
    }
  };

  const duplicateEstimate = async (estimateId: string) => {
    try {
      const { data: estimate, error: fetchError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (fetchError) throw fetchError;

      // Create new estimate with copied data
      const newEstimateNumber = `EST-${Date.now()}`;
      const { data: newEstimate, error: createError } = await supabase
        .from('estimates')
        .insert({
          job_id: estimate.job_id,
          estimate_number: newEstimateNumber,
          total: estimate.total,
          subtotal: estimate.subtotal,
          tax_amount: estimate.tax_amount,
          tax_rate: estimate.tax_rate,
          status: 'draft',
          notes: estimate.notes,
          items: estimate.items,
          description: estimate.description,
          title: estimate.title,
          terms: estimate.terms
        })
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Estimate duplicated successfully');
      return newEstimate;
    } catch (error) {
      console.error('Error duplicating estimate:', error);
      toast.error('Failed to duplicate estimate');
      return null;
    }
  };

  const refreshEstimatesData = async () => {
    return await fetchEstimatesWithJobs();
  };

  return {
    fetchEstimatesWithJobs,
    updateEstimateStatus,
    convertEstimateToInvoice,
    deleteEstimate,
    duplicateEstimate,
    refreshEstimatesData,
    isLoading
  };
};
