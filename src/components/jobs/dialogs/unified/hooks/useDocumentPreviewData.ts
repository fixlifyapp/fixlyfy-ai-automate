
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

        // Fetch job and client data directly
        if (jobId) {
          console.log('Fetching job data for jobId:', jobId);
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
              *,
              clients(*),
              client_properties(*)
            `)
            .eq('id', jobId)
            .maybeSingle();

          console.log('Job data fetched:', jobData);
          console.log('Job fetch error:', jobError);

          if (jobData && jobData.clients) {
            const client = jobData.clients;
            const finalClientInfo = {
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              company: client.company,
              type: client.type,
              fullAddress: [
                client.address,
                [client.city, client.state, client.zip].filter(Boolean).join(', '),
                client.country !== 'USA' ? client.country : null
              ].filter(Boolean).join('\n')
            };

            console.log('Setting client info:', finalClientInfo);
            setEnhancedClientInfo(finalClientInfo);

            // Get property address
            let propertyAddress = '';
            if (jobData.property_id && jobData.client_properties && jobData.client_properties.length > 0) {
              const property = jobData.client_properties.find(p => p.id === jobData.property_id) || jobData.client_properties[0];
              if (property) {
                propertyAddress = [
                  property.property_name ? `${property.property_name}` : '',
                  property.address,
                  [property.city, property.state, property.zip].filter(Boolean).join(', ')
                ].filter(Boolean).join('\n');
              }
            } else if (jobData.address) {
              propertyAddress = jobData.address;
            }

            setJobAddress(propertyAddress);
          } else {
            // Fallback if no job data
            console.log('No job data found, using fallback');
            setEnhancedClientInfo({
              name: 'Client Name',
              email: '',
              phone: '',
              company: '',
              fullAddress: 'Address not available'
            });
          }
        } else {
          // Fallback if no jobId
          console.log('No jobId provided, using fallback');
          setEnhancedClientInfo({
            name: clientInfo?.name || 'Client Name',
            email: clientInfo?.email || '',
            phone: clientInfo?.phone || '',
            company: clientInfo?.company || '',
            fullAddress: clientInfo?.address || 'Address not available'
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
