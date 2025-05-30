
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Brain, Bot, Settings, Zap } from "lucide-react";
import { AISettings } from "@/components/settings/AISettings";
import { AIAgentSettings } from "@/components/connect/AIAgentSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const AISettingsPage = () => {
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <PageHeader
        title="AI Settings"
        subtitle="Configure AI agent behavior, automation, and advanced settings"
        icon={Brain}
        badges={[
          { text: "AI Agent", icon: Bot, variant: "fixlyfy" },
          { text: "Automation", icon: Zap, variant: "success" },
          { text: "Advanced", icon: Settings, variant: "info" }
        ]}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-10' : ''}`}>
            <TabsTrigger value="general" className={isMobile ? 'text-sm' : ''}>
              General AI
            </TabsTrigger>
            <TabsTrigger value="agent" className={isMobile ? 'text-sm' : ''}>
              AI Agent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <AISettings />
          </TabsContent>
          
          <TabsContent value="agent" className="space-y-6">
            <AIAgentSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AISettingsPage;
