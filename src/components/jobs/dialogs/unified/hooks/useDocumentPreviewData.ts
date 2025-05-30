
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

        // Fetch company settings
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

        // Fetch job and client data if jobId is provided
        if (jobId) {
          console.log('Fetching job data for jobId:', jobId);
          
          // Get the job data first
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .maybeSingle();

          console.log('Job data fetched:', jobData);
          console.log('Job fetch error:', jobError);

          if (jobData && jobData.client_id) {
            // Fetch client data separately using client_id
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .select('*')
              .eq('id', jobData.client_id)
              .maybeSingle();

            console.log('Client data fetched:', clientData);
            console.log('Client fetch error:', clientError);

            if (clientData) {
              const finalClientInfo = {
                id: clientData.id,
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                company: clientData.company,
                type: clientData.type,
                fullAddress: [
                  clientData.address,
                  [clientData.city, clientData.state, clientData.zip].filter(Boolean).join(', '),
                  clientData.country !== 'USA' ? clientData.country : null
                ].filter(Boolean).join('\n')
              };

              console.log('Setting client info:', finalClientInfo);
              setEnhancedClientInfo(finalClientInfo);

              // Get property address if property_id exists
              let propertyAddress = '';
              if (jobData.property_id) {
                const { data: propertyData } = await supabase
                  .from('client_properties')
                  .select('*')
                  .eq('id', jobData.property_id)
                  .maybeSingle();

                if (propertyData) {
                  propertyAddress = [
                    propertyData.property_name ? `${propertyData.property_name}` : '',
                    propertyData.address,
                    [propertyData.city, propertyData.state, propertyData.zip].filter(Boolean).join(', ')
                  ].filter(Boolean).join('\n');
                }
              } else if (jobData.address) {
                // Use job address if no property is specified
                propertyAddress = jobData.address;
              }

              setJobAddress(propertyAddress);
            } else {
              console.log('No client data found for client_id:', jobData.client_id);
              setEnhancedClientInfo({
                name: 'Client Name Not Found',
                email: '',
                phone: '',
                company: '',
                fullAddress: 'Address not available'
              });
            }
          } else {
            console.log('No job data found or missing client_id');
            setEnhancedClientInfo({
              name: 'Job Not Found',
              email: '',
              phone: '',
              company: '',
              fullAddress: 'Address not available'
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
          fullAddress: 'Address not available'
        });
      } finally {
        setLoading(false);
      }
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
