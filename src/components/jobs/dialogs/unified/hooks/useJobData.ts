
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildClientAddress, buildPropertyAddress } from "../utils/addressFormatters";

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  fullAddress: string;
}

export const useJobData = (jobId?: string) => {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [jobAddress, setJobAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        console.log('=== Fetching job data for jobId:', jobId);

        // Fetch job with client and property relationships
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients!jobs_client_id_fkey(*),
            property:client_properties!jobs_property_id_fkey(*)
          `)
          .eq('id', jobId)
          .maybeSingle();

        console.log('Job data fetched:', jobData);
        console.log('Job fetch error:', jobError);

        if (jobError) {
          console.error('Error fetching job data:', jobError);
          setClientInfo({
            id: '',
            name: 'Error Loading Client',
            email: '',
            phone: '',
            company: '',
            type: 'Residential',
            fullAddress: 'Address not available'
          });
          setJobAddress('Address not available');
          return;
        }

        if (!jobData) {
          console.log('No job data found');
          setClientInfo({
            id: '',
            name: 'Job Not Found',
            email: '',
            phone: '',
            company: '',
            type: 'Residential',
            fullAddress: 'Job not found'
          });
          setJobAddress('Job not found');
          return;
        }

        // Process client information
        if (jobData.client) {
          const client = jobData.client;
          const finalClientInfo: ClientInfo = {
            id: client.id,
            name: client.name || 'Client Name',
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || '',
            type: client.type || 'Residential',
            fullAddress: buildClientAddress(client)
          };

          console.log('Setting client info:', finalClientInfo);
          setClientInfo(finalClientInfo);
        } else {
          console.log('No client data found in job');
          setClientInfo({
            id: '',
            name: 'No Client Found',
            email: '',
            phone: '',
            company: '',
            type: 'Residential',
            fullAddress: 'No address available'
          });
        }

        // Process property/job address
        let propertyAddress = '';
        if (jobData.property) {
          const property = jobData.property;
          propertyAddress = buildPropertyAddress(property);
          console.log('Property address set:', propertyAddress);
        } else if (jobData.address) {
          propertyAddress = jobData.address;
          console.log('Using job address:', propertyAddress);
        } else {
          propertyAddress = 'No service address specified';
          console.log('No address found');
        }

        setJobAddress(propertyAddress);

      } catch (error) {
        console.error('Error in fetchJobData:', error);
        setClientInfo({
          id: '',
          name: 'Error Loading Client',
          email: '',
          phone: '',
          company: '',
          type: 'Residential',
          fullAddress: 'Address not available'
        });
        setJobAddress('Address not available');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  return { clientInfo, jobAddress, loading };
};
