
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

        // First fetch the job data
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
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

        // Now fetch the client data separately using the client_id from the job
        if (jobData.client_id) {
          console.log('Fetching client with ID:', jobData.client_id);
          
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', jobData.client_id)
            .maybeSingle();

          console.log('Client data fetched:', clientData);
          console.log('Client fetch error:', clientError);

          if (clientData && !clientError) {
            const finalClientInfo: ClientInfo = {
              id: clientData.id,
              name: clientData.name || 'Client Name',
              email: clientData.email || '',
              phone: clientData.phone || '',
              company: clientData.company || '',
              type: clientData.type || 'Residential',
              fullAddress: buildClientAddress(clientData)
            };

            console.log('Setting client info:', finalClientInfo);
            setClientInfo(finalClientInfo);
          } else {
            console.log('No client data found or error:', clientError);
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
        } else {
          console.log('No client_id in job data');
          setClientInfo({
            id: '',
            name: 'No Client ID',
            email: '',
            phone: '',
            company: '',
            type: 'Residential',
            fullAddress: 'No client assigned'
          });
        }

        // Handle property/job address
        let propertyAddress = '';
        
        if (jobData.property_id) {
          console.log('Fetching property with ID:', jobData.property_id);
          
          const { data: propertyData, error: propertyError } = await supabase
            .from('client_properties')
            .select('*')
            .eq('id', jobData.property_id)
            .maybeSingle();

          console.log('Property data fetched:', propertyData);
          
          if (propertyData && !propertyError) {
            propertyAddress = buildPropertyAddress(propertyData);
            console.log('Property address set:', propertyAddress);
          }
        }
        
        // Fallback to job address if no property
        if (!propertyAddress && jobData.address) {
          propertyAddress = jobData.address;
          console.log('Using job address:', propertyAddress);
        }
        
        if (!propertyAddress) {
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
