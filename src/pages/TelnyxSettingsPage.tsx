
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { TelnyxSettings } from '@/components/telnyx/TelnyxSettings';
import { TelnyxCallsView } from '@/components/telnyx/TelnyxCallsView';
import { PhoneNumberPurchase } from '@/components/connect/PhoneNumberPurchase';
import { PhoneNumberManagement } from '@/components/settings/PhoneNumberManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Settings, History, ShoppingCart, Zap } from 'lucide-react';

const TelnyxSettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Telnyx Settings"
        subtitle="Complete Telnyx integration - Manage phone numbers, AI settings, analytics, and purchase new numbers"
        icon={Phone}
        badges={[
          { text: "AI Powered", icon: Settings, variant: "fixlyfy" },
          { text: "Real-time", icon: Zap, variant: "success" }
        ]}
      />

      <div className="container mx-auto py-6">
        <Tabs defaultValue="management" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Phone size={16} />
              Management
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              Purchase
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <History size={16} />
              Call Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-settings" className="flex items-center gap-2">
              <Settings size={16} />
              AI Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management">
            <PhoneNumberManagement />
          </TabsContent>

          <TabsContent value="purchase">
            <PhoneNumberPurchase />
          </TabsContent>

          <TabsContent value="analytics">
            <TelnyxCallsView />
          </TabsContent>

          <TabsContent value="ai-settings">
            <TelnyxSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TelnyxSettingsPage;
