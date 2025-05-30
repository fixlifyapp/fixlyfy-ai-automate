
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationsList } from "./AutomationsList";
import { AutomationBuilder } from "./AutomationBuilder";
import { AutomationPerformanceDashboard } from "./AutomationPerformanceDashboard";
import { AutomationTemplates } from "./AutomationTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Plus, 
  Settings, 
  BarChart3, 
  Sparkles, 
  Layers3,
  Brain,
  Target,
  MessageSquare
} from "lucide-react";

export const AutomationsPage = () => {
  const [selectedTab, setSelectedTab] = useState("automations");
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <PageLayout>
      <PageHeader
        title="Smart Automations"
        subtitle="Intelligent workflows powered by AI insights"
        icon={Zap}
        badges={[
          { text: "AI-Powered", icon: Brain, variant: "fixlify" },
          { text: "Smart Triggers", icon: Target, variant: "success" },
          { text: "Multi-Channel", icon: MessageSquare, variant: "info" }
        ]}
        actionButton={{
          text: "Create Automation",
          icon: Plus,
          onClick: () => setShowBuilder(true)
        }}
      />

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-fixlyfy-border/50">
          <TabsTrigger 
            value="automations" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Automations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Layers3 className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger 
            value="performance"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-6">
          <AutomationsList />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <AutomationTemplates onCreateFromTemplate={() => setShowBuilder(true)} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <AutomationPerformanceDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-fixlyfy-text-secondary">Configure global automation settings and preferences.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Default Variables</h4>
                    <p className="text-sm text-fixlyfy-text-secondary">Manage available variables for message templates</p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Integration Settings</h4>
                    <p className="text-sm text-fixlyfy-text-secondary">Configure Twilio and other service integrations</p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automation Builder Modal */}
      {showBuilder && (
        <AutomationBuilder 
          onClose={() => setShowBuilder(false)}
          onSave={() => {
            setShowBuilder(false);
            // Refresh automations list
          }}
        />
      )}
    </PageLayout>
  );
};
