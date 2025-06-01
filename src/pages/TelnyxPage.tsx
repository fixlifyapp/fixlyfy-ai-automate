
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TelnyxSettings } from '@/components/telnyx/TelnyxSettings';
import { TelnyxPhoneNumbersPage } from '@/components/telnyx/TelnyxPhoneNumbersPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Settings } from 'lucide-react';

const TelnyxPage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Telnyx Integration</h1>
          <p className="text-muted-foreground">
            Manage your AI phone system with Telnyx - Simple and powerful
          </p>
        </div>

        <Tabs defaultValue="numbers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="numbers" className="flex items-center gap-2">
              <Phone size={16} />
              Phone Numbers
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              AI Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="numbers">
            <TelnyxPhoneNumbersPage />
          </TabsContent>

          <TabsContent value="settings">
            <TelnyxSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TelnyxPage;
