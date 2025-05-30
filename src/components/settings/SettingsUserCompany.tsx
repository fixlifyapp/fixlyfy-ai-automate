
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
import { useState } from "react";

export const SettingsUserCompany = () => {
  const { settings: companySettings, loading: companyLoading, updateSettings: updateCompanySettings } = useCompanySettings();
  const { settings: userSettings, loading: userLoading, updateSettings: updateUserSettings } = useUserSettings();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for pending changes
  const [pendingUserChanges, setPendingUserChanges] = useState({});
  const [pendingCompanyChanges, setPendingCompanyChanges] = useState({});

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save user settings changes if any
      if (Object.keys(pendingUserChanges).length > 0) {
        await updateUserSettings(pendingUserChanges);
        setPendingUserChanges({});
      }
      
      // Save company settings changes if any
      if (Object.keys(pendingCompanyChanges).length > 0) {
        await updateCompanySettings(pendingCompanyChanges);
        setPendingCompanyChanges({});
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePendingUserSettings = (updates: any) => {
    setPendingUserChanges(prev => ({ ...prev, ...updates }));
  };

  const updatePendingCompanySettings = (updates: any) => {
    setPendingCompanyChanges(prev => ({ ...prev, ...updates }));
  };

  // Merge current settings with pending changes for display
  const currentUserSettings = { ...userSettings, ...pendingUserChanges };
  const currentCompanySettings = { ...companySettings, ...pendingCompanyChanges };

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
          disabled={isSaving || (Object.keys(pendingUserChanges).length === 0 && Object.keys(pendingCompanyChanges).length === 0)}
          className="bg-fixlyfy hover:bg-fixlyfy/90"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalInfoCard 
          userSettings={currentUserSettings}
          updateUserSettings={updatePendingUserSettings}
        />
        
        <CompanyInfoCard 
          companySettings={currentCompanySettings}
          updateCompanySettings={updatePendingCompanySettings}
        />
        
        <BrandingCard 
          companySettings={currentCompanySettings}
          updateCompanySettings={updatePendingCompanySettings}
        />
        
        <SystemSettingsCard 
          userSettings={currentUserSettings}
          updateUserSettings={updatePendingUserSettings}
        />
      </div>
    </div>
  );
};
