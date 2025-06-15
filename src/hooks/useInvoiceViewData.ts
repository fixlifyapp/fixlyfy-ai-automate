
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  client_id: string;
  title: string;
  description: string;
  status: string;
  total: number;
  amount_paid: number;
  issue_date: string;
  due_date: string;
  notes: string;
  items: any[];
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  client_id: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export const useInvoiceViewData = (id: string | undefined) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (invoiceError) throw invoiceError;

      // Parse items field properly - handle both string and array cases
      let parsedItems: any[] = [];
      if (invoiceData.items) {
        if (typeof invoiceData.items === 'string') {
          try {
            parsedItems = JSON.parse(invoiceData.items);
          } catch (e) {
            console.warn('Failed to parse invoice items JSON:', e);
            parsedItems = [];
          }
        } else if (Array.isArray(invoiceData.items)) {
          parsedItems = invoiceData.items;
        }
      }

      const formattedInvoice: Invoice = {
        ...invoiceData,
        items: parsedItems
      };

      setInvoice(formattedInvoice);

      // Fetch job details
      if (invoiceData.job_id) {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', invoiceData.job_id)
          .single();

        if (!jobError) {
          setJob(jobData);

          // Fetch client details
          if (jobData.client_id) {
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .select('*')
              .eq('id', jobData.client_id)
              .single();

            if (!clientError) {
              setClient(clientData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast.error('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  return {
    invoice,
    job,
    client,
    isLoading
  };
};
