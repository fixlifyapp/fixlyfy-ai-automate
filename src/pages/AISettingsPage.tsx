
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Brain, Bot, Settings, Zap } from "lucide-react";
import { UnifiedAISettings } from "@/components/settings/UnifiedAISettings";

const AISettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="AI Settings"
        subtitle="Comprehensive AI configuration, voice agents, and automation settings"
        icon={Brain}
        badges={[
          { text: "AI Agent", icon: Bot, variant: "fixlyfy" },
          { text: "Voice Dispatch", icon: Zap, variant: "success" },
          { text: "Amazon Connect", icon: Settings, variant: "info" }
        ]}
      />
      
      <UnifiedAISettings />
    </PageLayout>
  );
};

export default AISettingsPage;
