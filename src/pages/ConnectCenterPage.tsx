
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Settings, Users, BarChart3, Plus } from "lucide-react";
import { CallingInterface } from "@/components/connect/CallingInterface";
import { MessagesList } from "@/components/connect/MessagesList";
import { TelnyxCallsList } from "@/components/connect/TelnyxCallsList";
import { PhoneNumbersList } from "@/components/connect/PhoneNumbersList";
import { ConnectTestStatus } from "@/components/connect/ConnectTestStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ConnectCenterPage = () => {
  const [activeTab, setActiveTab] = useState("calls");

  // Fetch recent calls from Telnyx
  const { data: recentCalls = [], isLoading: callsLoading } = useQuery({
    queryKey: ['recent-telnyx-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent calls:', error);
        return [];
      }
      return data || [];
    }
  });

  // Fetch recent messages
  const { data: recentMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent messages:', error);
        return [];
      }
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Center</h1>
          <p className="text-gray-600">Manage calls, messages, and communication settings</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Phone Number
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConnectTestStatus />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calls Today</span>
                <span className="font-medium">{recentCalls.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Messages Today</span>
                <span className="font-medium">{recentMessages.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Phone className="h-4 w-4" />
                Make Call
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calls" className="gap-2">
            <Phone className="h-4 w-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="phone-numbers" className="gap-2">
            <Users className="h-4 w-4" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="dialer" className="gap-2">
            <Settings className="h-4 w-4" />
            Dialer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <TelnyxCallsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <MessagesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phone-numbers" className="space-y-6">
          <PhoneNumbersList />
        </TabsContent>

        <TabsContent value="dialer" className="space-y-6">
          <CallingInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectCenterPage;
