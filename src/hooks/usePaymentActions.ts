
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type PaymentMethod = "cash" | "credit-card" | "e-transfer" | "cheque";
export type PaymentStatus = "completed" | "refunded" | "disputed";

export interface Payment {
  id: string;
  payment_date: string; // Use payment_date consistently
  clientId?: string;
  clientName?: string;
  jobId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  technicianId?: string;
  technicianName?: string;
  invoice_id?: string;
  created_at?: string;
  payment_number: string;
}

export const usePaymentActions = (jobId: string, refreshPayments: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePaymentNumber = () => {
    return `PAY-${Date.now()}`;
  };

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
          payment_date: new Date().toISOString().split('T')[0],
          payment_number: generatePaymentNumber(),
          status: 'completed'
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
        const newBalance = invoice.total - newAmountPaid;
        const newStatus: 'paid' | 'partial' | 'unpaid' = newBalance <= 0 ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            balance: newBalance,
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
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('amount, invoice_id')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) throw paymentError;

      const { error: refundError } = await supabase
        .from('payments')
        .insert({
          invoice_id: payment.invoice_id,
          amount: -payment.amount,
          method: 'refund',
          reference: `Refund for payment ${paymentId}`,
          payment_date: new Date().toISOString().split('T')[0],
          payment_number: generatePaymentNumber(),
          status: 'completed'
        });

      if (refundError) throw refundError;

      const { data: invoice } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) - payment.amount;
        const newBalance = invoice.total - newAmountPaid;
        const newStatus: 'paid' | 'partial' | 'unpaid' = newAmountPaid <= 0 ? 'unpaid' : newBalance <= 0 ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: Math.max(0, newAmountPaid),
            balance: newBalance,
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
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('amount, invoice_id')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) throw paymentError;

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      if (payment.amount > 0) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total, amount_paid')
          .eq('id', payment.invoice_id)
          .single();

        if (invoice) {
          const newAmountPaid = Math.max(0, (invoice.amount_paid || 0) - payment.amount);
          const newBalance = invoice.total - newAmountPaid;
          const newStatus: 'paid' | 'partial' | 'unpaid' = newAmountPaid <= 0 ? 'unpaid' : newBalance <= 0 ? 'paid' : 'partial';

          await supabase
            .from('invoices')
            .update({
              amount_paid: newAmountPaid,
              balance: newBalance,
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
