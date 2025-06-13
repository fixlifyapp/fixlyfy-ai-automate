import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Invoice {
  id: string;
  number?: string;
  invoice_number: string;
  amount?: number;
  total: number;
  job_id: string;
  status: string;
  date: string;
  due_date?: string;
  notes?: string;
  terms?: string;
  items?: any[];
  tax_rate?: number;
  tax_amount?: number;
  subtotal?: number;
  amount_paid?: number;
  balance_due?: number;
  balance?: number;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (jobId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshInvoices = async () => {
    console.log('Refreshing invoices for job:', jobId);
    try {
      setIsLoading(true);
      
      // First fetch invoices
      let invoiceQuery = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobId) {
        invoiceQuery = invoiceQuery.eq('job_id', jobId);
      }
      
      const { data: invoicesData, error: invoicesError } = await invoiceQuery;
      
      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        throw invoicesError;
      }
      
      console.log('Fetched invoices:', invoicesData);
      
      // Get unique client IDs
      const clientIds = [...new Set(invoicesData?.map(inv => inv.client_id).filter(Boolean))];
      
      // Fetch client data separately if we have client IDs
      let clientsMap = new Map();
      if (clientIds.length > 0) {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name, email, phone')
          .in('id', clientIds);
        
        if (!clientsError && clientsData) {
          clientsData.forEach(client => {
            clientsMap.set(client.id, client);
          });
        }
      }
      
      // Map the data to include the alias properties with proper status casting and client information
      const mappedData: Invoice[] = (invoicesData || []).map(item => {
        const client = item.client_id ? clientsMap.get(item.client_id) : null;
        
        return {
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
          client_name: client?.name || 'Unknown Client',
          client_email: client?.email,
          client_phone: client?.phone,
          client: client ? {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone
          } : undefined
        };
      });
      
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
