
import { useState } from 'react';

export interface Invoice {
  id: string;
  job_id: string;
  invoice_number: string;
  number: string;
  date: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (jobId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshInvoices = () => {
    console.log('Refresh invoices - to be implemented with new schema');
  };

  return {
    invoices,
    setInvoices,
    isLoading,
    refreshInvoices
  };
};
