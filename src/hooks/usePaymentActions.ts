
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
      
      // Generate payment number
      const { data: paymentNumber } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'payment'
      });

      // Insert payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentData.invoiceId,
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference,
          notes: paymentData.notes,
          payment_number: paymentNumber,
          status: 'completed'
        });

      if (paymentError) throw paymentError;

      // Update invoice amount_paid and status
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', paymentData.invoiceId)
        .single();

      if (fetchError) throw fetchError;

      const newAmountPaid = (invoice.amount_paid || 0) + paymentData.amount;
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
          amount_paid: newAmountPaid,
          status: newStatus,
          paid_at: newBalance <= 0 ? new Date().toISOString() : null
        })
        .eq('id', paymentData.invoiceId);

      if (updateError) throw updateError;

      // Log the payment in job history - this is the critical part for partial payments
      console.log('Logging payment to job history:', {
        jobId,
        amount: paymentData.amount,
        method: paymentData.method,
        isPartial: newBalance > 0
      });

      await logPaymentReceived(
        paymentData.amount, 
        paymentData.method as any, 
        paymentData.reference
      );

      console.log('Payment successfully recorded and logged to history');
      toast.success('Payment recorded successfully!');
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment. Please try again.');
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
