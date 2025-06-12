
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  job_id: string;
  invoice_number: string;
  number: string; // Alias for compatibility
  date: string;
  status: 'draft' | 'sent' | 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  amount_paid: number;
  balance: number;
  notes?: string;
  items?: any[]; // JSON array from database
  created_at: string;
  updated_at: string;
  due_date?: string;
  issue_date?: string;
  estimate_id?: string;
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
      const invoicesWithBalance: Invoice[] = data?.map(invoice => ({
        ...invoice,
        number: invoice.invoice_number,
        amount_paid: invoice.amount_paid || 0,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        notes: invoice.notes || '',
        issue_date: invoice.issue_date || invoice.created_at,
        estimate_id: invoice.estimate_id || undefined,
        items: Array.isArray(invoice.items) ? invoice.items : [],
        status: invoice.status as 'draft' | 'sent' | 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled',
        date: invoice.issue_date || invoice.created_at
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

  const refetch = refreshInvoices;

  useEffect(() => {
    fetchInvoices();
  }, [jobId]);

  return {
    invoices,
    setInvoices,
    isLoading,
    loading: isLoading,
    refreshInvoices,
    refetch
  };
};
