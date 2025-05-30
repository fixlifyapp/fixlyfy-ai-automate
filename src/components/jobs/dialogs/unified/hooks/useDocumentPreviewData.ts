
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

        console.log('=== UnifiedDocumentPreview Debug ===');
        console.log('Initial clientInfo:', clientInfo);
        console.log('jobId:', jobId);
        console.log('documentType:', documentType);
        console.log('documentNumber:', documentNumber);

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

        // Multiple strategies to fetch client data
        let finalClientInfo = null;

        // Strategy 1: Try to get client data from estimate_details_view or invoice_details_view
        if (documentType === 'estimate') {
          console.log('Fetching from estimate_details_view for estimate:', documentNumber);
          const { data: estimateDetails, error: estimateError } = await supabase
            .from('estimate_details_view')
            .select('*')
            .eq('estimate_number', documentNumber)
            .maybeSingle();

          console.log('Estimate details from view:', estimateDetails);
          console.log('Estimate error:', estimateError);

          if (estimateDetails && estimateDetails.client_name) {
            finalClientInfo = {
              name: estimateDetails.client_name,
              email: estimateDetails.client_email,
              phone: estimateDetails.client_phone,
              company: estimateDetails.client_company,
              fullAddress: estimateDetails.client_id ? 'Loading address...' : 'No address available'
            };
            
            // Try to get full client address
            if (estimateDetails.client_id) {
              const { data: fullClient } = await supabase
                .from('clients')
                .select('address, city, state, zip, country')
                .eq('id', estimateDetails.client_id)
                .maybeSingle();
              
              if (fullClient) {
                finalClientInfo.fullAddress = [
                  fullClient.address,
                  [fullClient.city, fullClient.state, fullClient.zip].filter(Boolean).join(', '),
                  fullClient.country !== 'USA' ? fullClient.country : null
                ].filter(Boolean).join('\n');
              }
            }

            // Set job address if available
            if (estimateDetails.job_id) {
              setJobAddress(estimateDetails.job_description || '');
            }
          }
        } else if (documentType === 'invoice') {
          console.log('Fetching from invoice_details_view for invoice:', documentNumber);
          const { data: invoiceDetails, error: invoiceError } = await supabase
            .from('invoice_details_view')
            .select('*')
            .eq('invoice_number', documentNumber)
            .maybeSingle();

          console.log('Invoice details from view:', invoiceDetails);
          console.log('Invoice error:', invoiceError);

          if (invoiceDetails && invoiceDetails.client_name) {
            finalClientInfo = {
              name: invoiceDetails.client_name,
              email: invoiceDetails.client_email,
              phone: invoiceDetails.client_phone,
              company: invoiceDetails.client_company,
              fullAddress: invoiceDetails.client_id ? 'Loading address...' : 'No address available'
            };
            
            // Try to get full client address
            if (invoiceDetails.client_id) {
              const { data: fullClient } = await supabase
                .from('clients')
                .select('address, city, state, zip, country')
                .eq('id', invoiceDetails.client_id)
                .maybeSingle();
              
              if (fullClient) {
                finalClientInfo.fullAddress = [
                  fullClient.address,
                  [fullClient.city, fullClient.state, fullClient.zip].filter(Boolean).join(', '),
                  fullClient.country !== 'USA' ? fullClient.country : null
                ].filter(Boolean).join('\n');
              }
            }

            // Set job address if available
            if (invoiceDetails.job_id) {
              setJobAddress(invoiceDetails.job_description || '');
            }
          }
        }

        // Strategy 2: If we have a jobId, fetch the job with client data
        if (!finalClientInfo && jobId) {
          console.log('Fetching job data for jobId:', jobId);
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
              *,
              client:clients(*)
            `)
            .eq('id', jobId)
            .maybeSingle();

          console.log('Job data fetched:', jobData);
          console.log('Job fetch error:', jobError);

          if (jobData && jobData.client) {
            finalClientInfo = {
              ...jobData.client,
              fullAddress: [
                jobData.client.address,
                [jobData.client.city, jobData.client.state, jobData.client.zip].filter(Boolean).join(', '),
                jobData.client.country !== 'USA' ? jobData.client.country : null
              ].filter(Boolean).join('\n')
            };

            // Set job address from job data
            if (jobData.address) {
              setJobAddress(jobData.address);
            } else if (jobData.property_id) {
              // Fetch property address
              const { data: property } = await supabase
                .from('client_properties')
                .select('address, city, state, zip, property_name')
                .eq('id', jobData.property_id)
                .maybeSingle();
              
              if (property) {
                const propertyAddress = [
                  property.property_name ? `${property.property_name}:` : '',
                  property.address,
                  [property.city, property.state, property.zip].filter(Boolean).join(', ')
                ].filter(Boolean).join('\n');
                setJobAddress(propertyAddress);
              }
            }
          }
        }

        // Strategy 3: Try from the passed clientInfo with enhanced fetching
        if (!finalClientInfo && (clientInfo?.id || clientInfo?.client_id)) {
          const clientId = clientInfo.id || clientInfo.client_id;
          console.log('Fetching client by ID:', clientId);
          
          const { data: fullClientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .maybeSingle();

          console.log('Client data fetched:', fullClientData);
          console.log('Client fetch error:', clientError);
          
          if (fullClientData) {
            finalClientInfo = {
              ...clientInfo,
              ...fullClientData,
              name: fullClientData.name || clientInfo.name,
              fullAddress: [
                fullClientData.address,
                [fullClientData.city, fullClientData.state, fullClientData.zip].filter(Boolean).join(', '),
                fullClientData.country !== 'USA' ? fullClientData.country : null
              ].filter(Boolean).join('\n')
            };
          }
        }

        // Final fallback - use whatever clientInfo we have or a default
        if (!finalClientInfo) {
          console.log('Using fallback client info. Passed clientInfo:', clientInfo);
          finalClientInfo = {
            name: clientInfo?.name || clientInfo?.client_name || 'Client Name Not Available',
            email: clientInfo?.email || clientInfo?.client_email || '',
            phone: clientInfo?.phone || clientInfo?.client_phone || '',
            company: clientInfo?.company || clientInfo?.client_company || '',
            type: clientInfo?.type || '',
            fullAddress: clientInfo?.address || clientInfo?.fullAddress || 'Address not available'
          };
        }

        console.log('Final client info being set:', finalClientInfo);
        setEnhancedClientInfo(finalClientInfo);

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
          name: clientInfo?.name || clientInfo?.client_name || 'Error Loading Client',
          email: clientInfo?.email || clientInfo?.client_email || '',
          phone: clientInfo?.phone || clientInfo?.client_phone || '',
          company: clientInfo?.company || clientInfo?.client_company || '',
          fullAddress: clientInfo?.address || clientInfo?.fullAddress || 'Address not available'
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
