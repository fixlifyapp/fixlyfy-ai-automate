
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsUserCompany } from "@/components/settings/SettingsUserCompany";
import { User, Building2 } from "lucide-react";

const ProfileCompanyPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Profile & Company Settings"
        subtitle="Manage your personal and company information"
        icon={User}
        badges={[
          { text: "Personal", icon: User, variant: "fixlyfy" },
          { text: "Company", icon: Building2, variant: "success" }
        ]}
      />
      
      <SettingsUserCompany />
    </PageLayout>
  );
};

export default ProfileCompanyPage;
