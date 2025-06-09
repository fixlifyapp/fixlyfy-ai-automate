
import { useState, useEffect } from 'react';

export interface Invoice {
  id: string;
  invoice_number: string;
  number: string;
  job_id: string;
  estimate_id?: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    taxable: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useInvoices = (): UseInvoicesReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching invoices (MOCK)...');
      
      // Mock loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock invoices data
      const mockInvoices: Invoice[] = [
        {
          id: 'inv-001',
          invoice_number: 'INV-001',
          number: 'INV-001',
          job_id: 'job-001',
          estimate_id: 'est-001',
          total: 750.00,
          amount_paid: 0,
          balance: 750.00,
          status: 'unpaid',
          notes: 'HVAC maintenance invoice',
          items: [
            {
              id: 'item-1',
              description: 'HVAC System Inspection',
              quantity: 1,
              unit_price: 150.00,
              taxable: true
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'inv-002',
          invoice_number: 'INV-002',
          number: 'INV-002',
          job_id: 'job-002',
          total: 1250.00,
          amount_paid: 1250.00,
          balance: 0,
          status: 'paid',
          notes: 'Plumbing repair invoice',
          items: [
            {
              id: 'item-2',
              description: 'Pipe Repair',
              quantity: 1,
              unit_price: 300.00,
              taxable: true
            }
          ],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      console.log('✅ Mock invoices loaded:', mockInvoices);
      setInvoices(mockInvoices);
    } catch (err: any) {
      console.error('❌ Error fetching invoices:', err);
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const refetch = () => {
    fetchInvoices();
  };

  return {
    invoices,
    isLoading,
    error,
    refetch
  };
};
