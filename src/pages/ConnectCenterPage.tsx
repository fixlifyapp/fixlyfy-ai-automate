
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquare, Mail, Bot, Users, Settings as SettingsIcon } from 'lucide-react';
import { CallingInterface } from '@/components/connect/CallingInterface';
import { CallsList } from '@/components/connect/CallsList';
import { MessagesList } from '@/components/connect/MessagesList';
import { EmailsList } from '@/components/connect/EmailsList';
import { AIAgentDashboard } from '@/components/connect/AIAgentDashboard';
import { ConnectTestStatus } from '@/components/connect/ConnectTestStatus';

const ConnectCenterPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Connect Center"
        subtitle="Manage calls, messages, emails, and AI agents"
        icon={Phone}
        badges={[
          { text: "Amazon Connect", icon: Phone, variant: "fixlyfy" },
          { text: "AI Powered", icon: Bot, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <ConnectTestStatus />
        
        <Tabs defaultValue="calling" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calling">
              <Phone className="h-4 w-4 mr-2" />
              Calling
            </TabsTrigger>
            <TabsTrigger value="calls">
              <Phone className="h-4 w-4 mr-2" />
              Call History
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="ai-agent">
              <Bot className="h-4 w-4 mr-2" />
              AI Agent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calling" className="space-y-6">
            <CallingInterface />
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-6">
            <CallsList />
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-6">
            <MessagesList />
          </TabsContent>
          
          <TabsContent value="emails" className="space-y-6">
            <EmailsList />
          </TabsContent>
          
          <TabsContent value="ai-agent" className="space-y-6">
            <AIAgentDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ConnectCenterPage;
