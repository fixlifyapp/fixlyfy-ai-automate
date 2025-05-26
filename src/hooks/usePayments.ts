
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/types/payment';

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
        method: payment.method,
        status: 'paid' as const, // payments are always paid when recorded
        reference: payment.reference,
        notes: payment.notes,
        invoice_id: payment.invoice_id,
        created_at: payment.created_at,
        jobId: jobId // Add jobId for compatibility
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

  useEffect(() => {
    fetchPayments();
  }, [jobId]);

  return {
    payments,
    setPayments,
    isLoading,
    refreshPayments
  };
};
