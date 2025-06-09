
import { useState, useEffect } from 'react';

export interface Estimate {
  id: string;
  estimate_number: string;
  number: string;
  job_id: string;
  total: number;
  amount: number;
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

interface UseEstimatesReturn {
  estimates: Estimate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useEstimates = (): UseEstimatesReturn => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching estimates (MOCK)...');
      
      // Mock loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock estimates data
      const mockEstimates: Estimate[] = [
        {
          id: 'est-001',
          estimate_number: 'EST-001',
          number: 'EST-001',
          job_id: 'job-001',
          total: 750.00,
          amount: 750.00,
          status: 'draft',
          notes: 'HVAC maintenance estimate',
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
          id: 'est-002',
          estimate_number: 'EST-002',
          number: 'EST-002',
          job_id: 'job-002',
          total: 1250.00,
          amount: 1250.00,
          status: 'sent',
          notes: 'Plumbing repair estimate',
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

      console.log('✅ Mock estimates loaded:', mockEstimates);
      setEstimates(mockEstimates);
    } catch (err: any) {
      console.error('❌ Error fetching estimates:', err);
      setError(err.message || 'Failed to fetch estimates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const refetch = () => {
    fetchEstimates();
  };

  return {
    estimates,
    isLoading,
    error,
    refetch
  };
};
