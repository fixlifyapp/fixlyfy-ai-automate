
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TelnyxSettings } from '@/components/telnyx/TelnyxSettings';
import { TelnyxPhoneNumbersPage } from '@/components/telnyx/TelnyxPhoneNumbersPage';
import { TelnyxCallsView } from '@/components/telnyx/TelnyxCallsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, History, Bot, BarChart3 } from 'lucide-react';

const TelnyxPage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Phone System</h1>
          <p className="text-muted-foreground">
            Complete AI-powered phone system with Telnyx - Manage numbers, configure AI, and track calls
          </p>
        </div>

        <Tabs defaultValue="numbers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="numbers" className="flex items-center gap-2">
              <Phone size={16} />
              Phone Numbers
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Bot size={16} />
              AI Settings
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Call Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="numbers">
            <TelnyxPhoneNumbersPage />
          </TabsContent>

          <TabsContent value="settings">
            <TelnyxSettings />
          </TabsContent>

          <TabsContent value="calls">
            <TelnyxCallsView />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TelnyxPage;
