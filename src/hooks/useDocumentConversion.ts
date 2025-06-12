
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useDocumentConversion = () => {
  const [isConverting, setIsConverting] = useState(false);

  const convertEstimateToInvoice = async (estimateId: string) => {
    setIsConverting(true);
    try {
      console.log('Converting estimate to invoice:', estimateId);
      
      // Get the estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError || !estimate) {
        throw new Error('Failed to fetch estimate data');
      }

      // Create new invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          estimate_id: estimateId,
          invoice_number: invoiceNumber,
          total: estimate.total,
          subtotal: estimate.subtotal,
          tax_rate: estimate.tax_rate,
          tax_amount: estimate.tax_amount,
          items: estimate.items,
          notes: estimate.notes,
          status: 'draft',
          amount_paid: 0,
          balance: estimate.total,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (invoiceError) {
        throw new Error('Failed to create invoice');
      }

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);

      if (updateError) {
        console.error('Failed to update estimate status:', updateError);
        // Don't fail the whole operation for this
      }

      console.log('Successfully converted estimate to invoice:', invoice);
      return invoice;
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

  const convertInvoiceToEstimate = async (invoiceId: string) => {
    setIsConverting(true);
    try {
      console.log('Converting invoice to estimate:', invoiceId);
      
      // Get the invoice data
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Failed to fetch invoice data');
      }

      // Create new estimate
      const estimateNumber = `EST-${Date.now()}`;
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          job_id: invoice.job_id,
          estimate_number: estimateNumber,
          total: invoice.total,
          subtotal: invoice.subtotal,
          tax_rate: invoice.tax_rate,
          tax_amount: invoice.tax_amount,
          items: invoice.items,
          notes: invoice.notes,
          status: 'draft',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (estimateError) {
        throw new Error('Failed to create estimate');
      }

      // Update invoice status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'converted' })
        .eq('id', invoiceId);

      if (updateError) {
        console.error('Failed to update invoice status:', updateError);
        // Don't fail the whole operation for this
      }

      console.log('Successfully converted invoice to estimate:', estimate);
      return estimate;
    } catch (error) {
      console.error('Error converting invoice to estimate:', error);
      toast.error('Failed to convert invoice to estimate');
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convertEstimateToInvoice,
    convertInvoiceToEstimate,
    isConverting
  };
};
