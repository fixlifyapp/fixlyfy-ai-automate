
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  job_id: string;
  number: string;
  date: string;
  status: string;
  total: number;
  amount_paid?: number;
  balance?: number;
  items?: any[];
  created_at: string;
  updated_at: string;
}

export const useInvoices = (jobId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!jobId) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculate balance for each invoice
      const invoicesWithBalance = data?.map(invoice => ({
        ...invoice,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0)
      })) || [];
      
      setInvoices(invoicesWithBalance);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInvoices = () => {
    fetchInvoices();
  };

  useEffect(() => {
    fetchInvoices();
  }, [jobId]);

  return {
    invoices,
    isLoading,
    refreshInvoices
  };
};
