
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectCallsList } from "@/components/connect/ConnectCallsList";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";
import { AICallAnalytics } from "@/components/connect/AICallAnalytics";
import { Button } from "@/components/ui/button";
import { Bot, Zap, BarChart3, Settings, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AiCenterPage = () => {
  const [activeTab, setActiveTab] = useState("ai-calls");
  const [unreadCounts, setUnreadCounts] = useState({
    aiCalls: 0
  });
  const navigate = useNavigate();

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
        // Navigate to settings for AI configuration
        navigate("/settings?tab=ai-settings");
        break;
      case "ai-monitor":
        // Refresh the monitor view
        window.location.reload();
        break;
      case "ai-analytics":
        // Generate a new report or refresh analytics
        window.location.reload();
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "ai-calls": return "Configure AI Dispatcher";
      case "ai-monitor": return "Refresh Monitor";
      case "ai-analytics": return "Refresh Analytics";
      default: return "Configure";
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="AI Dispatcher Center"
        subtitle="Monitor and analyze your AI-powered call handling and appointment scheduling"
        icon={Bot}
        badges={[
          { text: "AI-Powered", icon: Bot, variant: "fixlyfy" },
          { text: "Real-time Monitor", icon: Zap, variant: "success" },
          { text: "Analytics", icon: Target, variant: "info" }
        ]}
        actionButton={{
          text: getActionButtonText(),
          icon: activeTab === "ai-calls" ? Settings : BarChart3,
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
