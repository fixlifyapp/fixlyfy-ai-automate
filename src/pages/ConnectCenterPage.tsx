
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesList } from "@/components/connect/MessagesList";
import { CallsList } from "@/components/connect/CallsList";
import { EmailsList } from "@/components/connect/EmailsList";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const ConnectCenterPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time updates for connect center page
  useUnifiedRealtime({
    tables: ['messages', 'calls', 'emails', 'conversations', 'clients'],
    onUpdate: () => {
      console.log('Real-time update triggered for connect center page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Center</h1>
          <p className="text-gray-600">Manage all your customer communications</p>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="phone-numbers">Phone Numbers</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <MessagesList key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="calls">
            <CallsList key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="emails">
            <EmailsList key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="phone-numbers">
            <PhoneNumbersList key={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ConnectCenterPage;
