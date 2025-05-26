
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  job_id: string;
  invoice_number: string;
  number: string; // Alias for compatibility
  date: string;
  status: string;
  total: number;
  amount_paid: number; // Make this required to match the actions hook
  balance: number;
  notes?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
  due_date?: string;
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
      
      // Calculate balance for each invoice and add alias properties
      const invoicesWithBalance = data?.map(invoice => ({
        ...invoice,
        number: invoice.invoice_number, // Alias for compatibility
        amount_paid: invoice.amount_paid || 0, // Ensure amount_paid is always a number
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        notes: invoice.notes || ''
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
    setInvoices, // Add this missing method
    isLoading,
    refreshInvoices
  };
};
