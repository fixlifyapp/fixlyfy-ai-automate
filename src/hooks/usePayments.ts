
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  payment_number: string;
  invoice_id?: string;
  job_id?: string;
  client_id?: string;
  amount: number;
  method: 'cash' | 'credit-card' | 'e-transfer' | 'cheque' | 'bank-transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  reference?: string;
  notes?: string;
  payment_date: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
}

export const usePayments = (jobId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPayments = async () => {
    await fetchPayments();
  };

  const createPayment = async (paymentData: Partial<Payment>) => {
    try {
      // Generate payment number
      const { data: nextIdData } = await supabase.rpc('generate_next_id', { 
        p_entity_type: 'payment' 
      });
      
      const newPayment = {
        ...paymentData,
        payment_number: nextIdData || `PAY-${Date.now()}`,
        job_id: jobId || paymentData.job_id,
      };

      const { data, error } = await supabase
        .from('payments')
        .insert([newPayment])
        .select()
        .single();

      if (error) throw error;
      
      await refreshPayments();
      return data;
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [jobId]);

  return {
    payments,
    isLoading,
    error,
    refetch: refreshPayments,
    refreshPayments,
    createPayment
  };
};
