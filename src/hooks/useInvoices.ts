
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
  created_at: string;
  updated_at: string;
}

export const useInvoices = (jobId?: string) => {
  const [invoices] = useState<Invoice[]>([]);
  const [isLoading] = useState(false);

  return {
    invoices,
    isLoading,
    error: null,
    refetch: () => Promise.resolve()
  };
};
