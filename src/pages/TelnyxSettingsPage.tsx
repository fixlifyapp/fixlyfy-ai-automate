
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { TelnyxPhoneManagement } from '@/components/telnyx/TelnyxPhoneManagement';
import { TelnyxAIAnalytics } from '@/components/telnyx/TelnyxAIAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Bot, Settings, Zap } from 'lucide-react';

const TelnyxSettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Telnyx Settings"
        subtitle="Complete phone system management - Numbers, AI configuration, and call analytics"
        icon={Phone}
        badges={[
          { text: "AI Powered", icon: Bot, variant: "fixlyfy" },
          { text: "Real-time", icon: Zap, variant: "success" }
        ]}
      />

      <div className="container mx-auto py-6">
        <Tabs defaultValue="phone-numbers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone-numbers" className="flex items-center gap-2">
              <Phone size={16} />
              Phone Numbers
            </TabsTrigger>
            <TabsTrigger value="ai-analytics" className="flex items-center gap-2">
              <Bot size={16} />
              AI & Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone-numbers">
            <TelnyxPhoneManagement />
          </TabsContent>

          <TabsContent value="ai-analytics">
            <TelnyxAIAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TelnyxSettingsPage;
