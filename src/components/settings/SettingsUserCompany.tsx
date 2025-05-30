
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalInfoSection } from "./profile/PersonalInfoSection";
import { CompanyInfoSection } from "./profile/CompanyInfoSection";
import { BrandingSection } from "./profile/BrandingSection";
import { SystemSettingsSection } from "./profile/SystemSettingsSection";
import { RolePreviewSection } from "./profile/RolePreviewSection";
import { toast } from "sonner";

export const SettingsUserCompany = () => {
  const { settings: companySettings, loading: companyLoading, saving: companySaving, updateSettings: updateCompanySettings } = useCompanySettings();
  const { settings: userSettings, loading: userLoading, saving: userSaving, updateSettings: updateUserSettings } = useUserSettings();

  const handleSaveChanges = async () => {
    try {
      // The individual sections handle their own saving automatically
      // This button provides user feedback that changes are being saved
      if (!companySaving && !userSaving) {
        toast.success('All settings have been saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save some settings');
    }
  };

  if (companyLoading || userLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <PersonalInfoSection 
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
      />
      
      <Separator />
      
      <CompanyInfoSection 
        companySettings={companySettings}
        updateCompanySettings={updateCompanySettings}
      />
      
      <Separator />
      
      <BrandingSection 
        companySettings={companySettings}
        updateCompanySettings={updateCompanySettings}
      />
      
      <Separator />
      
      <SystemSettingsSection 
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
      />
      
      <Separator />
      
      <RolePreviewSection />
      
      <div className="flex justify-end">
        <Button 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          disabled={companySaving || userSaving}
          onClick={handleSaveChanges}
        >
          {(companySaving || userSaving) ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
