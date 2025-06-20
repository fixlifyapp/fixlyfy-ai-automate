
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/documents';

export const useInvoiceActions = (invoiceId: string, refreshInvoices: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePaymentNumber = () => {
    return `PAY-${Date.now()}`;
  };

  const recordPayment = async (paymentData: {
    amount: number;
    method: string;
    notes?: string;
  }): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Insert payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          amount: paymentData.amount,
          method: paymentData.method,
          payment_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          payment_number: generatePaymentNumber(),
          notes: paymentData.notes || '',
          status: 'completed'
        });

      if (paymentError) throw paymentError;

      // Update invoice status and amounts
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + paymentData.amount;
        const newBalance = invoice.total - newAmountPaid;
        const newStatus = newBalance <= 0 ? 'paid' : 'partial';

        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            balance: newBalance,
            status: newStatus
          })
          .eq('id', invoiceId);

        if (updateError) throw updateError;
      }

      toast.success('Payment recorded successfully');
      refreshInvoices();
      return true;
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const markAsPaid = async (): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Get invoice total
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total, amount_paid')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      if (invoice) {
        const remainingBalance = invoice.total - (invoice.amount_paid || 0);
        
        if (remainingBalance > 0) {
          // Record the remaining payment
          await recordPayment({
            amount: remainingBalance,
            method: 'other',
            notes: 'Marked as paid'
          });
        } else {
          // Just update status if already fully paid
          const { error: updateError } = await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoiceId);

          if (updateError) throw updateError;
          
          toast.success('Invoice marked as paid');
          refreshInvoices();
        }
      }

      return true;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const sendInvoice = async (recipient: string, method: 'email' | 'sms'): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Implementation would depend on your email/SMS service
      toast.success(`Invoice sent via ${method} to ${recipient}`);
      
      // Update invoice sent status
      const { error } = await supabase
        .from('invoices')
        .update({ 
          sent_at: new Date().toISOString(),
          status: 'sent'
        })
        .eq('id', invoiceId);

      if (error) throw error;
      
      refreshInvoices();
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteInvoice = async (): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Delete related payments first
      await supabase
        .from('payments')
        .delete()
        .eq('invoice_id', invoiceId);

      // Delete the invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast.success('Invoice deleted successfully');
      refreshInvoices();
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    recordPayment,
    markAsPaid,
    sendInvoice,
    deleteInvoice,
    isProcessing
  };
};
