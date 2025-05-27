
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectCallsList } from "@/components/connect/ConnectCallsList";
import { AIAgentDashboard } from "@/components/connect/AIAgentDashboard";
import { AICallAnalytics } from "@/components/connect/AICallAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Zap, BarChart3, Settings, Users, Target, Brain, Send, Loader2, DollarSign, Calendar, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

type Message = {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

const AiCenterPage = () => {
  const [activeTab, setActiveTab] = useState("ai-calls");
  const [unreadCounts, setUnreadCounts] = useState({
    aiCalls: 0
  });
  const navigate = useNavigate();

  // AI Assistant state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your AI business assistant. I'm connected to your business data. Ask me about your metrics, revenue, clients, or any other business insights.",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const { generateBusinessInsights, businessData, isLoading } = useAI({
    systemContext: "You are an AI business analyst with access to the company's data. Provide specific, data-backed insights and recommendations based on user questions.",
    fetchBusinessData: true,
    mode: "business",
    forceRefresh: false
  });
  const isMobile = useIsMobile();

  // Read query parameters to handle direct navigation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "ai-calls";
  
  // Set the active tab based on URL parameters
  useEffect(() => {
    if (tabParam && ["ai-calls", "ai-monitor", "ai-analytics", "ai-assistant"].includes(tabParam)) {
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input.trim(),
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    try {
      const aiResponse = await generateBusinessInsights(input.trim());
      
      if (aiResponse) {
        const aiMessage: Message = {
          id: messages.length + 2,
          content: aiResponse,
          role: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Could not generate a response");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      toast.error("Failed to get AI insights", {
        description: "There was an error processing your request. Please try again."
      });
      
      const errorMessage: Message = {
        id: messages.length + 2,
        content: "I'm sorry, I encountered an error while generating insights. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

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
      case "ai-assistant":
        // Clear chat and start new conversation
        setMessages([{
          id: 1,
          content: "Hello! I'm your AI business assistant. I'm connected to your business data. Ask me about your metrics, revenue, clients, or any other business insights.",
          role: "assistant",
          timestamp: new Date()
        }]);
        setInput("");
        break;
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case "ai-calls": return "Configure AI Dispatcher";
      case "ai-monitor": return "Refresh Monitor";
      case "ai-analytics": return "Refresh Analytics";
      case "ai-assistant": return "New Chat";
      default: return "Configure";
    }
  };

  const renderBusinessMetrics = () => {
    if (!businessData) return null;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center flex-wrap gap-2">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span>Current Business Metrics</span>
            {businessData.lastRefreshed && (
              <span className="text-xs text-muted-foreground">
                Last updated: {format(new Date(businessData.lastRefreshed || new Date()), 'MMM d, yyyy')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-2 flex-shrink-0">
              <Users size={12} className="text-fixlyfy" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-fixlyfy-text-secondary">Clients</p>
              <p className="text-sm font-medium">{businessData.metrics?.clients?.total || "0"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-2 flex-shrink-0">
              <Briefcase size={12} className="text-fixlyfy" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-fixlyfy-text-secondary">Jobs</p>
              <p className="text-sm font-medium">{businessData.metrics?.jobs?.total || "0"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-2 flex-shrink-0">
              <DollarSign size={12} className="text-fixlyfy" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-fixlyfy-text-secondary">Revenue</p>
              <p className="text-sm font-medium">
                ${businessData.metrics?.revenue?.total?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-2 flex-shrink-0">
              <Calendar size={12} className="text-fixlyfy" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-fixlyfy-text-secondary">Scheduled</p>
              <p className="text-sm font-medium">{businessData.metrics?.jobs?.scheduled || "0"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
          icon: activeTab === "ai-calls" ? Settings : activeTab === "ai-assistant" ? Brain : BarChart3,
          onClick: handleNewAction
        }}
      />
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
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
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Brain size={16} />
            <span className="hidden sm:inline">AI Assistant</span>
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

        <TabsContent value="ai-assistant" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-300px)] sm:h-[calc(100vh-200px)]">
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="fixlyfy-gradient rounded-full p-2">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="truncate">Business Insights Assistant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-70px)]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={cn(
                          "flex gap-3 max-w-full",
                          message.role === "user" ? "justify-end ml-auto" : ""
                        )}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarFallback className="bg-fixlyfy text-white">AI</AvatarFallback>
                          </Avatar>
                        )}
                        <div 
                          className={cn(
                            "px-4 py-3 rounded-lg break-words",
                            message.role === "assistant" 
                              ? "bg-fixlyfy-bg-interface text-fixlyfy-text border border-fixlyfy/10" 
                              : "bg-fixlyfy text-white",
                            isMobile ? "max-w-[85%]" : "max-w-[90%]"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>TC</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-fixlyfy text-white">AI</AvatarFallback>
                        </Avatar>
                        <div className="px-4 py-3 rounded-lg bg-fixlyfy-bg-interface border border-fixlyfy/10 text-fixlyfy-text">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-fixlyfy animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-fixlyfy animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-fixlyfy animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t flex gap-2 mt-auto">
                    <Input
                      placeholder="Ask about your business metrics, revenue, clients..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 min-w-0"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      className="bg-fixlyfy hover:bg-fixlyfy/90 flex-shrink-0"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              {renderBusinessMetrics()}
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sample Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setInput("What is my total revenue?");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    <span className="truncate">What is my total revenue?</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setInput("How many clients do I have?");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    <span className="truncate">How many clients do I have?</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setInput("What are my most profitable services?");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    <span className="truncate">What are my most profitable services?</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setInput("Show me the performance of my technicians");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    <span className="truncate">Show me technician performance</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default AiCenterPage;
