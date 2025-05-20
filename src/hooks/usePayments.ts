
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment, PaymentMethod, PaymentStatus } from "@/types/payment";

export interface PaymentFormData {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export const usePayments = (jobId?: string, invoiceId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPayments = async () => {
    if (!jobId && !invoiceId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select('*, clients(name)');
        
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      
      const formattedPayments: Payment[] = (data || []).map(p => ({
        id: p.id,
        date: p.date,
        clientId: p.client_id,
        clientName: p.clients?.name || 'Unknown Client',
        jobId: p.job_id,
        amount: p.amount,
        method: p.method as PaymentMethod,
        status: p.status as PaymentStatus,
        reference: p.reference,
        notes: p.notes,
        technicianId: p.technician_id,
        technicianName: p.technician_name || undefined
      }));
      
      setPayments(formattedPayments);
      
      // Calculate totals
      let paid = 0;
      let refunded = 0;
      
      formattedPayments.forEach(payment => {
        if (payment.status === 'paid') {
          paid += payment.amount;
        } else if (payment.status === 'refunded') {
          refunded += payment.amount;
        }
      });
      
      setTotalPaid(paid);
      setTotalRefunded(refunded);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addPayment = async (payment: PaymentFormData, clientId: string) => {
    if (!jobId) {
      toast.error('Job ID is required to add a payment');
      return null;
    }
    
    try {
      // Create payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          job_id: jobId,
          client_id: clientId,
          invoice_id: invoiceId, // Optional
          date: new Date().toISOString(),
          amount: payment.amount,
          method: payment.method,
          status: 'paid',
          reference: payment.reference,
          notes: payment.notes
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If there is an invoice associated, update its status
      if (invoiceId) {
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('total')
          .eq('id', invoiceId)
          .single();
          
        if (invoiceError) throw invoiceError;
        
        // Get total payments for this invoice
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, status')
          .eq('invoice_id', invoiceId);
          
        if (paymentsError) throw paymentsError;
        
        // Calculate total paid amount
        const totalPaidAmount = (paymentsData || [])
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
          
        // Update invoice status if fully paid
        if (totalPaidAmount >= invoice.total) {
          const { error: updateError } = await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoiceId);
            
          if (updateError) throw updateError;
        }
      }
      
      toast.success(`Payment of $${payment.amount.toFixed(2)} added successfully`);
      
      // Refresh payments
      setRefreshTrigger(prev => prev + 1);
      
      return data;
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
      return null;
    }
  };
  
  const refundPayment = async (paymentId: string, amount?: number) => {
    try {
      // Get the payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
        
      if (paymentError) throw paymentError;
      
      // Create refund record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          job_id: payment.job_id,
          client_id: payment.client_id,
          invoice_id: payment.invoice_id,
          date: new Date().toISOString(),
          amount: amount || payment.amount,
          method: payment.method,
          status: 'refunded',
          reference: `Refund for ${payment.reference || paymentId}`,
          notes: `Refund for payment from ${new Date(payment.date).toLocaleDateString()}`
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update original payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', paymentId);
        
      if (updateError) throw updateError;
      
      toast.success(`Payment refunded successfully`);
      
      // Refresh payments
      setRefreshTrigger(prev => prev + 1);
      
      return data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error('Failed to process refund');
      return null;
    }
  };
  
  const deletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
        
      if (error) throw error;
      
      setPayments(payments.filter(p => p.id !== paymentId));
      toast.success('Payment deleted successfully');
      
      // Refresh to update totals
      setRefreshTrigger(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
      return false;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [jobId, invoiceId, refreshTrigger]);

  return {
    payments,
    isLoading,
    totalPaid,
    totalRefunded,
    netAmount: totalPaid - totalRefunded,
    addPayment,
    refundPayment,
    deletePayment,
    refreshPayments: () => setRefreshTrigger(prev => prev + 1)
  };
};
