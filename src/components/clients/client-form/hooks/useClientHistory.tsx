
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define specific history item types with proper discrimination
export interface BaseHistoryItem {
  id: string;
  title: string;
  status: string;
  date: string;
  description: string;
}

export interface JobHistoryItem extends BaseHistoryItem {
  type: 'job';
  jobId: string;
}

export interface InvoiceHistoryItem extends BaseHistoryItem {
  type: 'invoice';
  amount: number;
  invoiceId: string;
}

// Use discriminated union type
export type HistoryItem = JobHistoryItem | InvoiceHistoryItem;

export const useClientHistory = (clientId?: string) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!clientId) {
        setHistory([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get jobs for the client
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, status, date, created_at')
          .eq('client_id', clientId)
          .order('date', { ascending: false });
          
        if (jobsError) throw jobsError;
        
        // Get invoices for the client
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('id, invoice_number, date, total, status')
          .eq('client_id', clientId)
          .order('date', { ascending: false });
          
        if (invoicesError) throw invoicesError;
        
        // Map jobs to history items with explicit type
        const jobEntries: JobHistoryItem[] = (jobs || []).map(job => ({
          id: `job-${job.id}`,
          type: 'job',
          title: job.title,
          status: job.status,
          date: job.date,
          description: `Job ${job.status}`,
          jobId: job.id
        }));
        
        // Map invoices to history items with explicit type
        const invoiceEntries: InvoiceHistoryItem[] = (invoices || []).map(invoice => ({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: `Invoice #${invoice.invoice_number}`,
          status: invoice.status,
          date: invoice.date,
          amount: invoice.total,
          description: `${invoice.status === 'paid' ? 'Paid' : 'Created'} invoice for $${invoice.total}`,
          invoiceId: invoice.id
        }));
        
        // Combine entries
        const allHistory: HistoryItem[] = [...jobEntries, ...invoiceEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setHistory(allHistory);
      } catch (error) {
        console.error("Error loading client history:", error);
        toast({
          title: "Error",
          description: "Failed to load client history",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [clientId, toast]);
  
  return {
    history,
    isLoading,
  };
};
