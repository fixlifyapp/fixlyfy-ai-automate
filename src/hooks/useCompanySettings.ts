
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BusinessHours, DEFAULT_BUSINESS_HOURS } from '@/types/businessHours';

export interface CompanySettings {
  id?: string;
  user_id?: string;
  // Company information
  company_name: string;
  business_type: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  company_country: string;
  // Contact information
  company_phone: string;
  company_email: string;
  company_website: string;
  tax_id: string;
  // Branding
  company_logo_url?: string;
  company_tagline: string;
  company_description: string;
  // Service areas
  service_radius: number;
  service_zip_codes: string;
  // Business hours
  business_hours: BusinessHours;
  created_at?: string;
  updated_at?: string;
}

const defaultCompanySettings: CompanySettings = {
  company_name: 'Fixlyfy Services Inc.',
  business_type: 'HVAC & Plumbing Services',
  company_address: '123 Business Park, Suite 456',
  company_city: 'San Francisco',
  company_state: 'California',
  company_zip: '94103',
  company_country: 'United States',
  company_phone: '(555) 123-4567',
  company_email: 'contact@fixlyfy.com',
  company_website: 'https://www.fixlyfy.com',
  tax_id: 'XX-XXXXXXX',
  company_tagline: 'Smart Solutions for Field Service Businesses',
  company_description: 'Fixlyfy Services provides professional HVAC, plumbing and electrical services to residential and commercial customers throughout the Bay Area. Our team of skilled technicians is available 24/7 for all your service needs.',
  service_radius: 50,
  service_zip_codes: '94103, 94104, 94105, 94107, 94108, 94109, 94110, 94111, 94112, 94114, 94115, 94116, 94117, 94118, 94121, 94122, 94123, 94124, 94127, 94129, 94130, 94131, 94132, 94133, 94134, 94158',
  business_hours: DEFAULT_BUSINESS_HOURS
};

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company settings:', error);
        return;
      }

      if (data) {
        const businessHours = data.business_hours ? 
          (typeof data.business_hours === 'string' ? JSON.parse(data.business_hours) : data.business_hours) :
          DEFAULT_BUSINESS_HOURS;
          
        setSettings({ 
          ...defaultCompanySettings, 
          ...data,
          business_hours: businessHours
        });
      } else {
        // Create default settings if none exist
        const { error: insertError } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            ...defaultCompanySettings,
            business_hours: JSON.stringify(DEFAULT_BUSINESS_HOURS)
          });
        
        if (!insertError) {
          setSettings(defaultCompanySettings);
        }
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const newSettings = { ...settings, ...updates };
      
      // Prepare data for database
      const dataToUpdate = {
        ...newSettings,
        business_hours: JSON.stringify(newSettings.business_hours)
      };
      
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          ...dataToUpdate
        });

      if (error) throw error;

      setSettings(newSettings);
      console.log('Company settings updated successfully');
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast.error('Failed to update company settings');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings
  };
};
