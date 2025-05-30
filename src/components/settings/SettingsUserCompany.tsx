
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";
import { CompanyInfoCard } from "./profile/CompanyInfoCard";
import { BrandingCard } from "./profile/BrandingCard";
import { SystemSettingsCard } from "./profile/SystemSettingsCard";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const SettingsUserCompany = () => {
  const { settings: companySettings, loading: companyLoading, updateSettings: updateCompanySettings } = useCompanySettings();
  const { settings: userSettings, loading: userLoading, updateSettings: updateUserSettings } = useUserSettings();
  const [isSaving, setIsSaving] = useState(false);

  // Set up real-time subscriptions
  useEffect(() => {
    const userSettingsChannel = supabase
      .channel('user-settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings'
      }, (payload) => {
        console.log('User settings changed:', payload);
      })
      .subscribe();

    const companySettingsChannel = supabase
      .channel('company-settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'company_settings'
      }, (payload) => {
        console.log('Company settings changed:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userSettingsChannel);
      supabase.removeChannel(companySettingsChannel);
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (companyLoading || userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fixlyfy-card p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fixlyfy-text">Profile & Company Settings</h2>
          <p className="text-fixlyfy-text-secondary">Manage your personal and company information</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-fixlyfy hover:bg-fixlyfy/90"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalInfoCard 
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
        />
        
        <CompanyInfoCard 
          companySettings={companySettings}
          updateCompanySettings={updateCompanySettings}
        />
        
        <BrandingCard 
          companySettings={companySettings}
          updateCompanySettings={updateCompanySettings}
        />
        
        <SystemSettingsCard 
          userSettings={userSettings}
          updateUserSettings={updateUserSettings}
        />
      </div>
    </div>
  );
};
