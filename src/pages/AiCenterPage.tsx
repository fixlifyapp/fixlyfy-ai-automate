
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, Phone, Zap, TrendingUp, Clock } from "lucide-react";
import { TelnyxCallsView } from "@/components/telnyx/TelnyxCallsView";

const AiCenterPage = () => {
  const [activeTab, setActiveTab] = useState("calls");

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Center</h1>
          <p className="text-muted-foreground">
            Monitor and manage all AI-powered features and interactions
          </p>
        </div>

        {/* AI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Calls Today</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">3:42</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Status</p>
                  <Badge variant="default">Active</Badge>
                </div>
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone size={16} />
              AI Calls
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp size={16} />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calls" className="mt-0">
            <TelnyxCallsView />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics dashboard coming soon. Monitor call success rates, customer satisfaction, and AI performance metrics.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AiCenterPage;
