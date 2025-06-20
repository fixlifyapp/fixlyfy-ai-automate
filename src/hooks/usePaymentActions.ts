import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useJobHistoryIntegration } from '@/hooks/useJobHistoryIntegration';

export interface PaymentData {
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}

export const usePaymentActions = (jobId: string, onSuccess?: () => void) => {
  const { logPaymentReceived } = useJobHistoryIntegration(jobId);
  const [isProcessing, setIsProcessing] = useState(false);

  const addPayment = async (paymentData: PaymentData): Promise<boolean> => {
    setIsProcessing(true);
    try {
      console.log('Starting payment recording process for job:', jobId);
      console.log('Payment data:', paymentData);
      
      // Validate required data
      if (!paymentData.invoiceId) {
        throw new Error('Invoice ID is required');
      }
      
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      if (!paymentData.method) {
        throw new Error('Payment method is required');
      }

      // First, verify the invoice exists and get current state
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('id, total, amount_paid, status')
        .eq('id', paymentData.invoiceId)
        .single();

      if (fetchError) {
        console.error('Error fetching invoice:', fetchError);
        throw new Error('Invoice not found or access denied');
      }

      if (!currentInvoice) {
        throw new Error('Invoice not found');
      }

      // Generate payment number
      const { data: paymentNumber, error: numberError } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'payment'
      });

      if (numberError) {
        console.error('Error generating payment number:', numberError);
        throw new Error('Failed to generate payment number');
      }

      // Insert payment record
      const { data: paymentResult, error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentData.invoiceId,
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference || null,
          notes: paymentData.notes || null,
          payment_number: paymentNumber,
          status: 'completed',
          payment_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error inserting payment:', paymentError);
        throw new Error('Failed to record payment: ' + paymentError.message);
      }

      console.log('Payment inserted successfully:', paymentResult);

      // Calculate new amounts
      const currentAmountPaid = currentInvoice.amount_paid || 0;
      const newAmountPaid = currentAmountPaid + paymentData.amount;
      const newBalance = currentInvoice.total - newAmountPaid;
      
      let newStatus = 'unpaid';
      if (newBalance <= 0.01) { // Account for floating point precision
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'partial';
      }

      console.log('Updating invoice with new amounts:', {
        currentAmountPaid,
        newAmountPaid,
        newBalance,
        newStatus
      });

      // Update invoice amount_paid and status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          paid_at: newBalance <= 0.01 ? new Date().toISOString() : null
        })
        .eq('id', paymentData.invoiceId);

      if (updateError) {
        console.error('Error updating invoice:', updateError);
        // Try to rollback the payment
        await supabase
          .from('payments')
          .delete()
          .eq('id', paymentResult.id);
        throw new Error('Failed to update invoice status');
      }

      // Log the payment in job history
      console.log('About to log payment to job history:', {
        jobId,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        isPartial: newBalance > 0.01
      });

      try {
        await logPaymentReceived(
          paymentData.amount, 
          paymentData.method as any, 
          paymentData.reference
        );
        console.log('Payment successfully logged to job history');
      } catch (historyError) {
        console.error('Failed to log payment to job history:', historyError);
        // Don't fail the entire payment if history logging fails
        console.warn('Payment recorded but history logging failed');
      }

      console.log('Payment successfully recorded');
      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      console.error('Error recording payment:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to record payment: ${errorMessage}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const refundPayment = async (paymentId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Create refund record (negative amount)
      const { data: refundNumber } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'payment'
      });

      const { error: refundError } = await supabase
        .from('payments')
        .insert({
          invoice_id: payment.invoice_id,
          amount: -Math.abs(payment.amount),
          method: payment.method,
          reference: `Refund of ${payment.payment_number}`,
          notes: `Refund of payment ${payment.payment_number}`,
          payment_number: refundNumber,
          status: 'completed'
        });

      if (refundError) throw refundError;

      // Update invoice amount_paid and status
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (fetchError) throw fetchError;

      const newAmountPaid = (invoice.amount_paid || 0) - payment.amount;
      const newBalance = invoice.total - newAmountPaid;
      
      let newStatus = 'unpaid';
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'partial';
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: Math.max(0, newAmountPaid),
          status: newStatus,
          paid_at: newBalance <= 0 ? null : invoice.total === newAmountPaid ? new Date().toISOString() : null
        })
        .eq('id', payment.invoice_id);

      if (updateError) throw updateError;

      toast.success('Payment refunded successfully!');
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error('Failed to refund payment. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePayment = async (paymentId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Get payment details first
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Delete the payment
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) throw deleteError;

      // Update invoice amount_paid and status
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (fetchError) throw fetchError;

      const newAmountPaid = (invoice.amount_paid || 0) - payment.amount;
      const newBalance = invoice.total - newAmountPaid;
      
      let newStatus = 'unpaid';
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'partial';
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: Math.max(0, newAmountPaid),
          status: newStatus,
          paid_at: newBalance <= 0 ? null : null
        })
        .eq('id', payment.invoice_id);

      if (updateError) throw updateError;

      toast.success('Payment deleted successfully!');
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addPayment,
    refundPayment,
    deletePayment,
    isProcessing
  };
};
