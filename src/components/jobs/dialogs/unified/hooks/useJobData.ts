
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface JobData {
  id: string;
  title: string;
  description?: string;
  client_id?: string;
}

export const useJobData = (jobId: string) => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch job data with client information
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(*)
          `)
          .eq('id', jobId)
          .single();

        if (jobError) {
          console.error('Error fetching job:', jobError);
          throw jobError;
        }

        setJobData(job);

        // Extract client info
        if (job?.client) {
          const client = Array.isArray(job.client) ? job.client[0] : job.client;
          setClientInfo({
            id: client.id,
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || ''
          });
        }
      } catch (err: any) {
        console.error('Error in fetchJobData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  return {
    jobData,
    clientInfo,
    loading,
    error
  };
};
