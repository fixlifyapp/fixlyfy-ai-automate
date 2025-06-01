
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { CompanyInfoSection } from "@/components/settings/profile/CompanyInfoSection";
import { BrandingSection } from "@/components/settings/profile/BrandingSection";
import { BusinessHoursCard } from "@/components/settings/profile/BusinessHoursCard";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Building2 } from "lucide-react";

const ProfileCompanyPage = () => {
  const { settings, loading, saving, updateSettings } = useCompanySettings();

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  const handleBusinessHoursChange = async (businessHours: any) => {
    try {
      await updateSettings({ business_hours: businessHours });
    } catch (error) {
      console.error('Error updating business hours:', error);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Company Profile"
        subtitle="Manage your company information, branding, and business hours"
        icon={Building2}
      />
      
      <div className="space-y-6">
        <CompanyInfoSection 
          companySettings={settings}
          updateCompanySettings={updateSettings}
          isEditing={!saving}
        />
        
        <BrandingSection 
          companySettings={settings}
          updateCompanySettings={updateSettings}
          isEditing={!saving}
        />

        <BusinessHoursCard
          businessHours={settings.business_hours}
          onBusinessHoursChange={handleBusinessHoursChange}
        />
      </div>
    </PageLayout>
  );
};

export default ProfileCompanyPage;
