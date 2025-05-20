
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JobHeader {
  id: string;
  title: string;
  status: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export const useJobDetailsHeader = (jobId: string) => {
  const [jobHeaderData, setJobHeaderData] = useState<JobHeader | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobHeader = async () => {
      if (!jobId) return;
      
      setIsLoading(true);
      
      try {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            status,
            client_id
          `)
          .eq('id', jobId)
          .single();
          
        if (jobError) {
          console.error("Error loading job header:", jobError);
          setJobHeaderData({
            id: jobId,
            title: 'Error Loading Job',
            status: 'unknown'
          });
          setIsLoading(false);
          return;
        }
        
        // If job data is found, fetch client info
        if (jobData && jobData.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select(`
              id, 
              name,
              email,
              phone
            `)
            .eq('id', jobData.client_id)
            .single();
            
          if (clientError) {
            console.error("Error loading client data:", clientError);
          }
          
          setJobHeaderData({
            ...jobData,
            client: clientData || { id: jobData.client_id, name: 'Unknown Client' }
          });
        } else {
          // Set job data without client info
          setJobHeaderData(jobData || {
            id: jobId,
            title: 'Job Details',
            status: 'unknown'
          });
        }
      } catch (error) {
        console.error("Error in useJobDetailsHeader:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobHeader();
  }, [jobId]);

  return { jobHeaderData, isLoading };
};
