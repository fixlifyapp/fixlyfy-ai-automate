
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Payment } from './usePayments';

export const usePaymentActions = (jobId: string, refreshPayments: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const addPayment = async (paymentData: {
    invoiceId: string;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
  }): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentData.invoiceId,
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference,
          notes: paymentData.notes,
          payment_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Update invoice status and amounts
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', paymentData.invoiceId)
        .single();

      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + paymentData.amount;
        const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            status: newStatus
          })
          .eq('id', paymentData.invoiceId);
      }

      toast.success('Payment recorded successfully');
      refreshPayments();
      return true;
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to record payment');
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
        .select('amount, invoice_id')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) throw paymentError;

      // Create refund record
      const { error: refundError } = await supabase
        .from('payments')
        .insert({
          invoice_id: payment.invoice_id,
          amount: -payment.amount,
          method: 'refund',
          reference: `Refund for payment ${paymentId}`,
          payment_date: new Date().toISOString().split('T')[0]
        });

      if (refundError) throw refundError;

      // Update invoice amounts
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (invoice) {
        const newAmountPaid = Math.max(0, (invoice.amount_paid || 0) - payment.amount);
        const newStatus = newAmountPaid <= 0 ? 'sent' : newAmountPaid >= invoice.total ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            status: newStatus
          })
          .eq('id', payment.invoice_id);
      }

      toast.success('Payment refunded successfully');
      refreshPayments();
      return true;
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error('Failed to refund payment');
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
        .select('amount, invoice_id')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) throw paymentError;

      // Delete the payment
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      // Update invoice amounts if payment was positive (not a refund)
      if (payment.amount > 0) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total, amount_paid')
          .eq('id', payment.invoice_id)
          .single();

        if (invoice) {
          const newAmountPaid = Math.max(0, (invoice.amount_paid || 0) - payment.amount);
          const newStatus = newAmountPaid <= 0 ? 'sent' : newAmountPaid >= invoice.total ? 'paid' : 'partial';

          await supabase
            .from('invoices')
            .update({
              amount_paid: newAmountPaid,
              status: newStatus
            })
            .eq('id', payment.invoice_id);
        }
      }

      toast.success('Payment deleted successfully');
      refreshPayments();
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
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
