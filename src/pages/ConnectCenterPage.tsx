
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallsList } from "@/components/connect/CallsList";
import { MessagesList } from "@/components/connect/MessagesList";
import { EmailsList } from "@/components/connect/EmailsList";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { EnhancedCallingInterface } from "@/components/connect/EnhancedCallingInterface";
import { ConnectSearch } from "@/components/connect/components/ConnectSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail, Settings, Plus, Users, Zap, Target } from "lucide-react";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("calls");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <PageLayout>
      <PageHeader
        title="Connect Center"
        subtitle="Unified communication hub for calls, messages, and emails"
        icon={Phone}
        badges={[
          { text: "Multi-Channel", icon: Users, variant: "fixlyfy" },
          { text: "Real-time Sync", icon: Zap, variant: "success" },
          { text: "Smart Routing", icon: Target, variant: "info" }
        ]}
        actionButton={{
          text: "New Contact",
          icon: Plus,
          onClick: () => {}
        }}
      />

      {/* Search and Quick Actions */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <ConnectSearch 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search conversations, contacts, or phone numbers..."
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Make Call
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="dialer" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Dialer
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-6">
          <CallsList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <MessagesList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <EmailsList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="dialer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phone Dialer</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedCallingInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phone Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <PhoneNumbersList />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Communication Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Call Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure call routing and voicemail</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Message Templates</h4>
                    <p className="text-sm text-muted-foreground">Manage SMS and email templates</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Integration Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure Twilio and email providers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ConnectCenterPage;
