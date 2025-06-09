
import { useState } from 'react';

export interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
  date: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (jobId?: string) => {
  const [invoices] = useState<Invoice[]>([]);
  const [isLoading] = useState(false);

  const refreshInvoices = () => Promise.resolve();

  return {
    invoices,
    isLoading,
    error: null,
    refetch: refreshInvoices,
    refreshInvoices
  };
};
