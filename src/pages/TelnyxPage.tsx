
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Zap } from "lucide-react";
import { TelnyxConfig } from "@/components/settings/configuration/TelnyxConfig";

const TelnyxPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Telnyx Configuration"
        subtitle="Manage your Telnyx SMS and voice settings"
        icon={Zap}
        badges={[
          { text: "SMS", icon: Zap, variant: "fixlyfy" },
          { text: "Voice", icon: Zap, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <TelnyxConfig />
      </div>
    </PageLayout>
  );
};

export default TelnyxPage;
