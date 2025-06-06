
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Mail, Users, Settings, BarChart3 } from "lucide-react";
import { SimpleMessagesInterface } from "@/components/connect/components/SimpleMessagesInterface";
import { CallingInterface } from "@/components/connect/CallingInterface";
import { EmailManagement } from "@/components/connect/EmailManagement";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";
import { CallMonitoring } from "@/components/connect/CallMonitoring";
import { AICallAnalytics } from "@/components/connect/AICallAnalytics";

const ConnectCenterPageOptimized = () => {
  const [activeTab, setActiveTab] = useState("messages");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fixlyfy-text mb-2">Connect Center</h1>
        <p className="text-fixlyfy-text-secondary">
          Manage all your customer communications in one place
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="ai-agent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            AI Agent
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-fixlyfy" />
                SMS & Messaging
              </CardTitle>
              <CardDescription>
                Send and receive text messages with your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleMessagesInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-fixlyfy" />
                Voice Communications
              </CardTitle>
              <CardDescription>
                Make and receive calls with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallingInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-fixlyfy" />
                Email Management
              </CardTitle>
              <CardDescription>
                Send and manage email communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-agent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-fixlyfy" />
                AI Agent Dashboard
              </CardTitle>
              <CardDescription>
                Configure and monitor your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIAgentDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-fixlyfy" />
                Call Monitoring
              </CardTitle>
              <CardDescription>
                Monitor active calls and system status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-fixlyfy" />
                AI Call Analytics
              </CardTitle>
              <CardDescription>
                View detailed analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AICallAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectCenterPageOptimized;
