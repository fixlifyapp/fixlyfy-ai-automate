
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentMethod } from '@/types/payment';

export { Payment, PaymentMethod } from '@/types/payment';

export const usePayments = (jobId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    if (!jobId) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching payments for job:', jobId);

      // Fetch payments through invoices relationship
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner(job_id)
        `)
        .eq('invoices.job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      console.log('Fetched payments:', data);
      
      // Transform the data to match Payment interface
      const transformedPayments = data?.map(payment => ({
        id: payment.id,
        date: payment.date,
        amount: payment.amount,
        method: payment.method as PaymentMethod,
        status: 'paid' as const,
        reference: payment.reference,
        notes: payment.notes,
        invoice_id: payment.invoice_id,
        created_at: payment.created_at,
        jobId: jobId
      })) || [];

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPayments = () => {
    fetchPayments();
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const netAmount = totalPaid - totalRefunded;

  // Mock functions for compatibility - these would need proper implementation
  const addPayment = async (paymentData: any) => {
    console.log('Add payment:', paymentData);
    // Implementation would go here
  };

  const refundPayment = async (paymentId: string) => {
    console.log('Refund payment:', paymentId);
    // Implementation would go here
  };

  const deletePayment = async (paymentId: string) => {
    console.log('Delete payment:', paymentId);
    // Implementation would go here
  };

  useEffect(() => {
    fetchPayments();
  }, [jobId]);

  return {
    payments,
    setPayments,
    isLoading,
    refreshPayments,
    totalPaid,
    totalRefunded,
    netAmount,
    addPayment,
    refundPayment,
    deletePayment
  };
};
