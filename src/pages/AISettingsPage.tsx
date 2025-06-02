
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Brain, Bot, Settings, Zap } from "lucide-react";
import { SimplifiedAISettings } from "@/components/settings/SimplifiedAISettings";

const AISettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="AI Settings"
        subtitle="Configure your AI dispatcher for automatic call handling and appointment scheduling"
        icon={Brain}
        badges={[
          { text: "AI Dispatcher", icon: Bot, variant: "fixlyfy" },
          { text: "Voice AI", icon: Zap, variant: "success" },
          { text: "Telnyx Integration", icon: Settings, variant: "info" }
        ]}
      />
      
      <SimplifiedAISettings />
    </PageLayout>
  );
};

export default AISettingsPage;
