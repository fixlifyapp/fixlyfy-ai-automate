
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
  amount_paid: number;
  balance: number;
  notes?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
  due_date?: string;
  issue_date?: string; // Add this missing property
  estimate_id?: string; // Add this missing property
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
        notes: invoice.notes || '',
        issue_date: invoice.date, // Add issue_date as alias for date
        estimate_id: invoice.estimate_id || undefined // Add estimate_id
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

  // Add alias method for compatibility
  const refetch = refreshInvoices;

  useEffect(() => {
    fetchInvoices();
  }, [jobId]);

  return {
    invoices,
    setInvoices,
    isLoading,
    loading: isLoading, // Add alias for compatibility
    refreshInvoices,
    refetch // Add alias method for compatibility
  };
};
