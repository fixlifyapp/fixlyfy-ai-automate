
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectCallsList } from "@/components/connect/ConnectCallsList";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";
import { AICallAnalytics } from "@/components/connect/AICallAnalytics";
import { AmazonConnectInterface } from "@/components/connect/AmazonConnectInterface";
import { Button } from "@/components/ui/button";
import { Bot, Zap, BarChart3, Plus, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AiCenterPage = () => {
  const [activeTab, setActiveTab] = useState("ai-calls");
  const [unreadCounts, setUnreadCounts] = useState({
    aiCalls: 0
  });

  // Read query parameters to handle direct navigation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "ai-calls";
  
  // Set the active tab based on URL parameters
  useEffect(() => {
    if (tabParam && ["ai-calls", "ai-monitor", "ai-analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch unread counts for AI calls
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        // Count recent AI calls
        const { data: aiCalls } = await supabase
          .from('amazon_connect_calls')
          .select('id')
          .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        setUnreadCounts({
          aiCalls: aiCalls?.length || 0
        });
      } catch (error) {
        console.error("Error fetching AI call counts:", error);
      }
    };

    fetchUnreadCounts();
  }, []);

  const handleNewAction = () => {
    switch (activeTab) {
      case "ai-calls":
        // AI calls are automatically initiated by the AI agent
        break;
      case "ai-monitor":
        // Monitor view doesn't need new actions
        break;
      case "ai-analytics":
        // Analytics view doesn't need new actions
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "ai-calls": return "View AI Config";
      case "ai-monitor": return "Monitor Agent";
      case "ai-analytics": return "Generate Report";
      default: return "New Action";
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="AI Center"
        subtitle="Manage AI-powered calling, monitoring, and analytics"
        icon={Bot}
        badges={[
          { text: "AI-Powered", icon: Bot, variant: "fixlyfy" },
          { text: "Real-time Monitor", icon: Zap, variant: "success" },
          { text: "Advanced Analytics", icon: Target, variant: "info" }
        ]}
        actionButton={{
          text: getActionButtonText(),
          icon: Plus,
          onClick: handleNewAction
        }}
      />
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="ai-calls" className="flex items-center gap-2">
            <Bot size={16} />
            <span className="hidden sm:inline">AI Calls</span>
            {unreadCounts.aiCalls > 0 && (
              <Badge className="ml-1 bg-blue-600">{unreadCounts.aiCalls}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai-monitor" className="flex items-center gap-2">
            <Zap size={16} />
            <span className="hidden sm:inline">AI Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="ai-analytics" className="flex items-center gap-2">
            <BarChart3 size={16} />
            <span className="hidden sm:inline">AI Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-calls" className="mt-0">
          <div className="space-y-6">
            <AmazonConnectInterface />
            <ConnectCallsList />
          </div>
        </TabsContent>

        <TabsContent value="ai-monitor" className="mt-0">
          <AIAgentDashboard />
        </TabsContent>

        <TabsContent value="ai-analytics" className="mt-0">
          <AICallAnalytics />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default AiCenterPage;
