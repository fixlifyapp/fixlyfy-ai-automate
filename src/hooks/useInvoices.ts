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
  issue_date?: string;
  estimate_id?: string;
  tax_rate?: number; // Add missing tax_rate property
  tax_amount?: number; // Add missing tax_amount property
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
      const invoicesWithBalance: Invoice[] = (data || []).map(invoice => {
        // Handle JSON items field properly
        let items: any[] = [];
        if (invoice.items) {
          if (typeof invoice.items === 'string') {
            try {
              items = JSON.parse(invoice.items);
            } catch (e) {
              console.warn('Failed to parse invoice items JSON:', e);
              items = [];
            }
          } else if (Array.isArray(invoice.items)) {
            items = invoice.items;
          }
        }

        return {
          ...invoice,
          number: invoice.invoice_number, // Alias for compatibility
          amount_paid: invoice.amount_paid || 0, // Ensure amount_paid is always a number
          balance: (invoice.total || 0) - (invoice.amount_paid || 0),
          notes: invoice.notes || '',
          issue_date: invoice.issue_date || invoice.created_at, // Add issue_date as alias
          estimate_id: invoice.estimate_id || undefined, // Add estimate_id
          tax_rate: invoice.tax_rate || 0, // Include tax_rate from database
          tax_amount: invoice.tax_amount || 0, // Include tax_amount from database
          items: items // Properly handle items
        };
      });
      
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
