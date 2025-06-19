
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Invoice } from "@/types/documents";

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
      setInvoices(data || []);
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
