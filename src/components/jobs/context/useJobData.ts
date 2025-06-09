
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JobData {
  id: string;
  title: string;
  description?: string;
  status: string;
  client_id: string;
  clientId: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  address: string; // Made required
  service: string;
  phone?: string;
  email?: string;
  client: string;
  tasks?: any[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  technician_id?: string;
  date?: string;
  revenue?: number;
  notes?: string;
  total: number;
}

export const useJobData = (jobId: string) => {
  const [job, setJob] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshJobData = async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Mock job data for now since we don't have jobs table in the current schema
      const mockJob: JobData = {
        id: jobId,
        title: 'HVAC Maintenance Service',
        description: 'Annual HVAC system inspection and maintenance',
        status: 'scheduled',
        client_id: 'client-001',
        clientId: 'client-001',
        client_name: 'John Smith',
        client_phone: '(555) 123-4567',
        client_email: 'john.smith@email.com',
        address: '123 Main St, Anytown, ST 12345', // Always provide address
        service: 'HVAC Maintenance',
        phone: '(555) 123-4567',
        email: 'john.smith@email.com',
        client: 'John Smith',
        total: 0,
        tasks: [
          { id: '1', name: 'Inspect air filters', completed: false },
          { id: '2', name: 'Check refrigerant levels', completed: false },
          { id: '3', name: 'Clean condenser coils', completed: false }
        ],
        tags: ['hvac', 'maintenance', 'annual'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        technician_id: null,
        date: new Date().toISOString(),
        revenue: 0,
        notes: 'Customer prefers morning appointments'
      };

      setJob(mockJob);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading job data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshJobData();
  }, [jobId]);

  // Fast client info loading for performance
  const clientInfo = job ? {
    name: job.client_name || job.client || 'Unknown Client',
    email: job.client_email || job.email || '',
    phone: job.client_phone || job.phone || ''
  } : null;

  const jobAddress = job?.address || '';
  const loading = isLoading;

  return {
    job,
    isLoading,
    error,
    refreshJobData,
    clientInfo,
    jobAddress,
    loading
  };
};
