
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
  reference?: string;
  status?: string;
  client_id?: string;
  job_id?: string;
  technician_id?: string;
  technician_name?: string;
  created_at: string;
}

export interface PaymentInput {
  amount: number;
  method: string;
  date: string;
  notes?: string;
}

export const usePayments = (jobId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchPayments = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner(job_id)
        `)
        .eq('invoices.job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addPayment = async (paymentData: PaymentInput, invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{ 
          ...paymentData, 
          invoice_id: invoiceId
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchPayments();
      return data;
    } catch (err) {
      console.error('Error adding payment:', err);
      throw err;
    }
  };

  const refundPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', paymentId);

      if (error) throw error;
      await fetchPayments();
    } catch (err) {
      console.error('Error refunding payment:', err);
      throw err;
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
      await fetchPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  const refreshPayments = () => {
    fetchPayments();
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const netAmount = totalPaid - totalRefunded;

  useEffect(() => {
    fetchPayments();
  }, [jobId]);

  return {
    payments,
    isLoading,
    error,
    totalPaid,
    totalRefunded,
    netAmount,
    addPayment,
    refundPayment,
    deletePayment,
    refreshPayments,
    fetchPayments
  };
};
