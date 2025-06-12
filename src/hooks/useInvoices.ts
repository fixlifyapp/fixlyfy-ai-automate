
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Invoice {
  id: string;
  job_id: string;
  invoice_number: string;
  number: string; // alias for invoice_number
  date: string;
  total: number;
  amount: number; // alias for total
  amount_paid: number;
  balance: number;
  status: "draft" | "sent" | "paid" | "overdue" | "partial" | "unpaid" | "cancelled";
  notes?: string;
  items?: any[];
  balance_due?: number;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  created_at: string;
  created_by?: string;
  description?: string;
  discount_amount?: number;
  due_date?: string;
  estimate_id?: string;
  issue_date?: string;
  paid_at?: string;
  sent_at?: string;
  subtotal?: number;
  tax_amount?: number;
  tax_rate?: number;
  terms?: string;
  title?: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export const useInvoices = (jobId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshInvoices = async () => {
    console.log('Refreshing invoices for job:', jobId);
    try {
      setIsLoading(true);
      let query = supabase
        .from('invoices')
        .select(`
          *,
          clients:client_id (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      console.log('Fetched invoices:', data);
      
      // Map the data to include the alias properties with proper status casting and client information
      const mappedData: Invoice[] = (data || []).map(item => ({
        ...item,
        number: item.invoice_number || `INV-${item.id.slice(0, 8)}`,
        amount: item.total || 0, // Add amount alias
        date: item.created_at,
        items: Array.isArray(item.items) ? item.items : [],
        status: (item.status as "draft" | "sent" | "paid" | "overdue" | "partial" | "unpaid" | "cancelled") || "draft",
        balance: item.balance || (item.total - (item.amount_paid || 0)),
        balance_due: item.balance || (item.total - (item.amount_paid || 0)),
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        subtotal: item.subtotal || 0,
        discount_amount: item.discount_amount || 0,
        terms: item.terms || '',
        client_name: item.clients?.name || 'Unknown Client',
        client_email: item.clients?.email,
        client_phone: item.clients?.phone,
        client: item.clients ? {
          id: item.clients.id,
          name: item.clients.name,
          email: item.clients.email,
          phone: item.clients.phone
        } : undefined
      }));
      
      setInvoices(mappedData);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      refreshInvoices();
    }
  }, [jobId]);

  return {
    invoices,
    setInvoices,
    isLoading,
    refreshInvoices
  };
};
