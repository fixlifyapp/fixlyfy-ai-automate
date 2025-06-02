
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Mail, BarChart3, Zap, Bot } from "lucide-react";
import { EmailsList } from "@/components/connect/EmailsList";
import { RealEmailsList } from "@/components/connect/RealEmailsList";
import { EmailManagement } from "@/components/connect/EmailManagement";
import { EmailComposer } from "@/components/connect/EmailComposer";
import { EmailAnalytics } from "@/components/connect/EmailAnalytics";
import { MailgunTestPanel } from "@/components/connect/MailgunTestPanel";
import { AmazonConnectFlowInstructions } from "@/components/connect/AmazonConnectFlowInstructions";

const ConnectPage = () => {
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Communication Center</h1>
        <p className="text-muted-foreground">
          Manage all your customer communications from one place
        </p>
      </div>

      <Tabs defaultValue="emails" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-1">
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Center
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Voice & AI
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Emails</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">68%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-2xl font-bold">34%</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Automation Rate</p>
                    <p className="text-2xl font-bold">89%</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <RealEmailsList />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>

        <TabsContent value="conversations">
          <EmailManagement />
        </TabsContent>

        <TabsContent value="voice">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  AI Voice Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Active Calls</p>
                        <p className="text-2xl font-bold text-green-900">3</p>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Live</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Today's Calls</p>
                        <p className="text-2xl font-bold text-blue-900">28</p>
                      </div>
                      <Badge variant="secondary">Today</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-800">AI Handled</p>
                        <p className="text-2xl font-bold text-purple-900">85%</p>
                      </div>
                      <Badge variant="secondary">Auto</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AmazonConnectFlowInstructions />
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Email Automation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">Active Automations</p>
                    <p className="text-2xl font-bold text-green-900">12</p>
                    <p className="text-sm text-green-600">Running smoothly</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">Emails Sent Today</p>
                    <p className="text-2xl font-bold text-blue-900">347</p>
                    <p className="text-sm text-blue-600">Via automation</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-800">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-900">94%</p>
                    <p className="text-sm text-purple-600">Last 7 days</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800">Response Rate</p>
                    <p className="text-2xl font-bold text-orange-900">23%</p>
                    <p className="text-sm text-orange-600">Above average</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <MailgunTestPanel />
        </TabsContent>
      </Tabs>

      {showEmailComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EmailComposer 
            onClose={() => setShowEmailComposer(false)}
            onSent={() => setShowEmailComposer(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ConnectPage;
