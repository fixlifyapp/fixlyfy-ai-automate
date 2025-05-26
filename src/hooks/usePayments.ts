
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod, PaymentStatus, Payment, PaymentInput } from '@/types/payment';

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
      
      // Transform the data to match our Payment interface
      const transformedPayments: Payment[] = (data || []).map(payment => ({
        id: payment.id,
        date: payment.date,
        amount: payment.amount,
        method: payment.method as PaymentMethod,
        status: 'paid' as PaymentStatus, // Default status since column doesn't exist yet
        reference: payment.reference,
        notes: payment.notes,
        invoice_id: payment.invoice_id,
        created_at: payment.created_at
      }));
      
      setPayments(transformedPayments);
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
      // For now, just update locally since status column doesn't exist
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'refunded' as PaymentStatus } : p
      ));
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

// Re-export types for convenience
export type { PaymentMethod, PaymentStatus, Payment, PaymentInput };
