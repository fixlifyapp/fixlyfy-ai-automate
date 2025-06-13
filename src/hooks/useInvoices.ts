
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  client_id?: string;
  estimate_id?: string;
  total: number;
  subtotal: number;
  tax_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  amount_paid?: number;
  balance?: number;
  balance_due?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial' | 'unpaid' | 'cancelled';
  items: any[];
  notes?: string;
  terms?: string;
  description?: string;
  title?: string;
  issue_date: string;
  due_date?: string;
  sent_at?: string;
  paid_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  date?: string;
  client_name?: string; // For display purposes
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely convert Json to array
  const convertJsonToArray = (jsonValue: any): any[] => {
    if (!jsonValue) return [];
    if (Array.isArray(jsonValue)) return jsonValue;
    if (typeof jsonValue === 'string') {
      try {
        const parsed = JSON.parse(jsonValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Transform database invoice to Invoice interface
  const transformInvoice = (dbInvoice: any): Invoice => {
    return {
      ...dbInvoice,
      items: convertJsonToArray(dbInvoice.items),
      client_name: dbInvoice.client?.name || dbInvoice.client_id || 'Unknown Client'
    };
  };

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedInvoices = (data || []).map(transformInvoice);
      setInvoices(transformedInvoices);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? transformInvoice(data) : null;
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      toast.error('Failed to load invoice');
      return null;
    }
  };

  const createInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice | null> => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          items: JSON.stringify(invoiceData.items || [])
        }])
        .select()
        .single();

      if (error) throw error;

      const newInvoice = transformInvoice(data);
      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('Invoice created successfully');
      return newInvoice;
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      toast.error('Failed to create invoice');
      return null;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice | null> => {
    try {
      const updateData = {
        ...updates,
        items: updates.items ? JSON.stringify(updates.items) : undefined
      };

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedInvoice = transformInvoice(data);
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      toast.success('Invoice updated successfully');
      return updatedInvoice;
    } catch (err: any) {
      console.error('Error updating invoice:', err);
      toast.error('Failed to update invoice');
      return null;
    }
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast.success('Invoice deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      toast.error('Failed to delete invoice');
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    isLoading,
    error,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refreshInvoices: fetchInvoices
  };
};
