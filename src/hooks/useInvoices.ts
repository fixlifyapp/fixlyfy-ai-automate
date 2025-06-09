
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  client_id?: string;
  estimate_id?: string;
  title?: string;
  description?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  total: number;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  amount_paid: number;
  balance_due: number;
  items: any[];
  notes?: string;
  terms?: string;
  issue_date: string;
  due_date?: string;
  sent_at?: string;
  paid_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (jobId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInvoices = async () => {
    await fetchInvoices();
  };

  const createInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      // Generate invoice number
      const { data: nextIdData } = await supabase.rpc('generate_next_id', { 
        p_entity_type: 'invoice' 
      });
      
      const newInvoice = {
        ...invoiceData,
        invoice_number: nextIdData || `INV-${Date.now()}`,
        job_id: jobId || invoiceData.job_id,
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([newInvoice])
        .select()
        .single();

      if (error) throw error;
      
      await refreshInvoices();
      return data;
    } catch (err) {
      console.error('Error creating invoice:', err);
      throw err;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await refreshInvoices();
      return data;
    } catch (err) {
      console.error('Error updating invoice:', err);
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refreshInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [jobId]);

  return {
    invoices,
    setInvoices,
    isLoading,
    error,
    refetch: refreshInvoices,
    refreshInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice
  };
};
