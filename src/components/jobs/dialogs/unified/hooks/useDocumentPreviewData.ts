
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseDocumentPreviewDataProps {
  clientInfo?: any;
  jobId?: string;
  documentNumber: string;
  documentType: string;
}

export const useDocumentPreviewData = ({
  clientInfo,
  jobId,
  documentNumber,
  documentType
}: UseDocumentPreviewDataProps) => {
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [enhancedClientInfo, setEnhancedClientInfo] = useState<any>(null);
  const [jobAddress, setJobAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('=== useDocumentPreviewData Debug ===');
        console.log('Initial clientInfo:', clientInfo);
        console.log('jobId:', jobId);
        console.log('documentType:', documentType);

        // Fetch company settings first
        const { data: companySettings } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (companySettings) {
          setCompanyInfo({
            name: companySettings.company_name,
            businessType: companySettings.business_type,
            address: companySettings.company_address,
            city: companySettings.company_city,
            state: companySettings.company_state,
            zip: companySettings.company_zip,
            country: companySettings.company_country,
            phone: companySettings.company_phone,
            email: companySettings.company_email,
            website: companySettings.company_website,
            taxId: companySettings.tax_id,
            logoUrl: companySettings.company_logo_url,
            tagline: companySettings.company_tagline,
            description: companySettings.company_description
          });
        } else {
          // Fallback company info
          setCompanyInfo({
            name: 'FixLyfy Services',
            businessType: 'Professional Service Solutions',
            address: '456 Professional Ave, Suite 100',
            city: 'Business City',
            state: 'BC',
            zip: 'V1V 1V1',
            country: 'Canada',
            phone: '(555) 123-4567',
            email: user.email || 'info@fixlyfy.com',
            website: 'www.fixlyfy.com',
            tagline: 'Professional Service You Can Trust',
            description: 'Licensed & Insured Professional Services'
          });
        }

        // Fetch job with client and property data if jobId is provided
        if (jobId) {
          console.log('Fetching comprehensive job data for jobId:', jobId);
          
          // Single query to get all related data
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
              *,
              client:clients!jobs_client_id_fkey(*),
              property:client_properties!jobs_property_id_fkey(*)
            `)
            .eq('id', jobId)
            .maybeSingle();

          console.log('Comprehensive job data fetched:', jobData);
          console.log('Job fetch error:', jobError);

          if (jobError) {
            console.error('Error fetching job data:', jobError);
            // Fallback to separate queries
            await fetchJobDataFallback(jobId);
            return;
          }

          if (jobData) {
            // Process client information
            if (jobData.client) {
              const client = jobData.client;
              const finalClientInfo = {
                id: client.id,
                name: client.name || 'Client Name',
                email: client.email || '',
                phone: client.phone || '',
                company: client.company || '',
                type: client.type || 'Residential',
                fullAddress: buildClientAddress(client)
              };

              console.log('Setting enhanced client info:', finalClientInfo);
              setEnhancedClientInfo(finalClientInfo);
            } else {
              console.log('No client data found in job');
              setEnhancedClientInfo({
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
          } else {
            console.log('No job data returned');
            setEnhancedClientInfo({
              name: 'Job Not Found',
              email: '',
              phone: '',
              company: '',
              type: 'Residential',
              fullAddress: 'Job not found'
            });
          }
        } else if (clientInfo) {
          // Use provided clientInfo if no jobId
          console.log('Using provided clientInfo:', clientInfo);
          setEnhancedClientInfo({
            name: clientInfo.name || 'Client Name',
            email: clientInfo.email || '',
            phone: clientInfo.phone || '',
            company: clientInfo.company || '',
            type: clientInfo.type || 'Residential',
            fullAddress: clientInfo.address || 'Address not available'
          });
        } else {
          // Complete fallback
          console.log('No jobId or clientInfo provided, using complete fallback');
          setEnhancedClientInfo({
            name: 'Client Name',
            email: '',
            phone: '',
            company: '',
            type: 'Residential',
            fullAddress: 'Address not available'
          });
        }

      } catch (error) {
        console.error('Error fetching preview data:', error);
        // Set fallback data on error
        setCompanyInfo({
          name: 'FixLyfy Services',
          businessType: 'Professional Service Solutions',
          phone: '(555) 123-4567',
          email: 'info@fixlyfy.com',
          address: '456 Professional Ave, Suite 100',
          city: 'Business City',
          state: 'BC',
          zip: 'V1V 1V1',
          website: 'www.fixlyfy.com'
        });
        setEnhancedClientInfo({
          name: 'Error Loading Client',
          email: '',
          phone: '',
          company: '',
          type: 'Residential',
          fullAddress: 'Address not available'
        });
      } finally {
        setLoading(false);
      }
    };

    // Helper function for fallback data fetching
    const fetchJobDataFallback = async (jobId: string) => {
      try {
        console.log('Using fallback method to fetch job data');
        
        // Get job data first
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();

        if (jobError || !job) {
          console.error('Error fetching job in fallback:', jobError);
          return;
        }

        console.log('Job data from fallback:', job);

        // Get client data if client_id exists
        if (job.client_id) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', job.client_id)
            .maybeSingle();

          if (client && !clientError) {
            const finalClientInfo = {
              id: client.id,
              name: client.name || 'Client Name',
              email: client.email || '',
              phone: client.phone || '',
              company: client.company || '',
              type: client.type || 'Residential',
              fullAddress: buildClientAddress(client)
            };

            console.log('Fallback client info set:', finalClientInfo);
            setEnhancedClientInfo(finalClientInfo);
          }
        }

        // Get property data if property_id exists
        if (job.property_id) {
          const { data: property, error: propertyError } = await supabase
            .from('client_properties')
            .select('*')
            .eq('id', job.property_id)
            .maybeSingle();

          if (property && !propertyError) {
            const propertyAddress = buildPropertyAddress(property);
            console.log('Fallback property address set:', propertyAddress);
            setJobAddress(propertyAddress);
          }
        } else if (job.address) {
          setJobAddress(job.address);
        }

      } catch (error) {
        console.error('Error in fallback fetch:', error);
      }
    };

    // Helper function to build client address
    const buildClientAddress = (client: any): string => {
      const addressParts = [];
      
      if (client.address) addressParts.push(client.address);
      
      const cityStateZip = [client.city, client.state, client.zip].filter(Boolean);
      if (cityStateZip.length > 0) {
        addressParts.push(cityStateZip.join(', '));
      }
      
      if (client.country && client.country !== 'USA') {
        addressParts.push(client.country);
      }
      
      return addressParts.length > 0 ? addressParts.join('\n') : 'Address not available';
    };

    // Helper function to build property address
    const buildPropertyAddress = (property: any): string => {
      const addressParts = [];
      
      if (property.property_name) {
        addressParts.push(property.property_name);
      }
      
      if (property.address) addressParts.push(property.address);
      
      const cityStateZip = [property.city, property.state, property.zip].filter(Boolean);
      if (cityStateZip.length > 0) {
        addressParts.push(cityStateZip.join(', '));
      }
      
      return addressParts.length > 0 ? addressParts.join('\n') : 'Property address not available';
    };

    fetchAllData();
  }, [clientInfo, jobId, documentNumber, documentType]);

  return {
    companyInfo,
    enhancedClientInfo,
    jobAddress,
    loading
  };
};
