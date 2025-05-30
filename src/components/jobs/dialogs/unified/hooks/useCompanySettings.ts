
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyInfo {
  name: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logoUrl: string;
  tagline: string;
  description: string;
}

export const useCompanySettings = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

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
      } catch (error) {
        console.error('Error fetching company settings:', error);
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
          country: 'Canada',
          website: 'www.fixlyfy.com',
          taxId: '',
          logoUrl: '',
          tagline: 'Professional Service You Can Trust',
          description: 'Licensed & Insured Professional Services'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanySettings();
  }, []);

  return { companyInfo, loading };
};
