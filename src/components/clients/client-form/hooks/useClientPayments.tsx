
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/types/payment';

export const useClientPayments = (clientId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      // Since payments table doesn't exist yet, return empty array
      setPayments([]);
    } catch (error) {
      console.error('Error fetching client payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [clientId]);

  return {
    payments,
    isLoading,
    refreshPayments: fetchPayments
  };
};
