import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Payment {
  id?: string;
  invoice_id?: string;
  amount?: number;
  method?: string;
  reference?: string;
  notes?: string;
  date?: string;
  created_at?: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const createPayment = async (payment: Payment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert(payment);

      if (error) throw error;
      await fetchPayments();
      toast.success('Payment created successfully');
      return true;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
      return false;
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          amount: updates.amount,
          method: updates.method,
          reference: updates.reference,
          notes: updates.notes,
          date: updates.date,
          created_at: updates.created_at,
          invoice_id: updates.invoice_id
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchPayments();
      toast.success('Payment updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
      return false;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPayments();
      toast.success('Payment deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
      return false;
    }
  };

  return {
    payments,
    isLoading,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  };
};
