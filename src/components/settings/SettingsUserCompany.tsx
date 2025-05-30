
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRBAC, PermissionRequired } from "@/components/auth/RBACProvider";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalInfoSection } from "./profile/PersonalInfoSection";
import { CompanyInfoSection } from "./profile/CompanyInfoSection";
import { ContactInfoSection } from "./profile/ContactInfoSection";
import { BrandingSection } from "./profile/BrandingSection";
import { ServiceAreasSection } from "./profile/ServiceAreasSection";
import { SystemSettingsSection } from "./profile/SystemSettingsSection";
import { RolePreviewSection } from "./profile/RolePreviewSection";

export const SettingsUserCompany = () => {
  const { settings: companySettings, loading: companyLoading, saving: companySaving, updateSettings: updateCompanySettings } = useCompanySettings();
  const { settings: userSettings, loading: userLoading, saving: userSaving, updateSettings: updateUserSettings } = useUserSettings();

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
      
      <ContactInfoSection 
        companySettings={companySettings}
        updateCompanySettings={updateCompanySettings}
      />
      
      <Separator />
      
      <BrandingSection 
        companySettings={companySettings}
        updateCompanySettings={updateCompanySettings}
      />
      
      <Separator />
      
      <ServiceAreasSection 
        companySettings={companySettings}
        updateCompanySettings={updateCompanySettings}
      />
      
      <Separator />
      
      <SystemSettingsSection 
        userSettings={userSettings}
        updateUserSettings={updateUserSettings}
      />
      
      <Separator />
      
      <PermissionRequired permission="settings.view">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personal Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calendar-sync">Calendar Integration</Label>
              <Select 
                value={userSettings.calendar_integration} 
                onValueChange={(value) => updateUserSettings({ calendar_integration: value })}
              >
                <SelectTrigger id="calendar-sync">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PermissionRequired>
      
      <Separator />
      
      <RolePreviewSection />
      
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          disabled={companySaving || userSaving}
        >
          {(companySaving || userSaving) ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
