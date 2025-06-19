
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Invoice } from "@/types/documents";

// Export the type for backward compatibility
export type { Invoice };

export const useInvoices = (jobId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      console.log('📊 Fetching invoices' + (jobId ? ` for job: ${jobId}` : ''));
      
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching invoices:', error);
        toast.error('Failed to load invoices');
        return;
      }

      console.log('✅ Invoices fetched:', data?.length || 0);
      
      // Transform data to match Invoice interface
      const transformedInvoices: Invoice[] = (data || []).map(item => ({
        ...item,
        status: item.status as Invoice['status'], // Type assertion for status
        payment_status: item.payment_status as Invoice['payment_status'], // Type assertion for payment_status
        items: Array.isArray(item.items) ? item.items : [], // Ensure items is always an array
        subtotal: item.subtotal || 0,
        total: item.total || 0,
        amount_paid: item.amount_paid || 0,
        tax_rate: item.tax_rate || 0,
        tax_amount: item.tax_amount || 0,
        discount_amount: item.discount_amount || 0,
        updated_at: item.updated_at || item.created_at,
        balance_due: (item.total || 0) - (item.amount_paid || 0)
      }));
      
      setInvoices(transformedInvoices);
    } catch (error) {
      console.error('❌ Error in fetchInvoices:', error);
      toast.error('Failed to load invoices');
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
