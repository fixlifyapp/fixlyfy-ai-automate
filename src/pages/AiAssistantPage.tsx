
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Send, Loader2, BarChart3, Users, Briefcase, DollarSign, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { format } from "date-fns";
import { BusinessMetrics } from "@/types/database";

type Message = {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

const AiAssistantPage = () => {
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
        // Debug log to check response
        console.log("AI response received:", aiResponse);
        
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

  const renderBusinessMetrics = () => {
    if (!businessData) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Current Business Metrics
            {businessData.metrics?.lastUpdated && (
              <span className="text-xs ml-auto text-muted-foreground">
                Last updated: {format(new Date(businessData.lastRefreshed || new Date()), 'MMM d, yyyy')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-3">
              <Users size={16} className="text-fixlyfy" />
            </div>
            <div>
              <p className="text-sm text-fixlyfy-text-secondary">Total Clients</p>
              <p className="font-medium">{businessData.metrics?.clients?.total || "0"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-3">
              <Briefcase size={16} className="text-fixlyfy" />
            </div>
            <div>
              <p className="text-sm text-fixlyfy-text-secondary">Total Jobs</p>
              <p className="font-medium">{businessData.metrics?.jobs?.total || "0"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-3">
              <DollarSign size={16} className="text-fixlyfy" />
            </div>
            <div>
              <p className="text-sm text-fixlyfy-text-secondary">Total Revenue</p>
              <p className="font-medium">
                ${businessData.metrics?.revenue?.total?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-3">
              <Calendar size={16} className="text-fixlyfy" />
            </div>
            <div>
              <p className="text-sm text-fixlyfy-text-secondary">Scheduled Jobs</p>
              <p className="font-medium">{businessData.metrics?.jobs?.scheduled || "0"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Business Assistant</h1>
        <p className="text-fixlyfy-text-secondary">
          Ask questions about your business and get AI-powered insights based on your actual business data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="fixlyfy-gradient rounded-full p-2">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Business Insights Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100%-70px)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex gap-3 max-w-3xl",
                      message.role === "user" && "justify-end ml-auto"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-fixlyfy text-white">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={cn(
                        "px-4 py-3 rounded-lg",
                        message.role === "assistant" 
                          ? "bg-fixlyfy-bg-interface text-fixlyfy-text border border-fixlyfy/10" 
                          : "bg-fixlyfy text-white"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
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
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-fixlyfy hover:bg-fixlyfy/90"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {renderBusinessMetrics()}
          
          <Card className="mb-6">
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
                What is my total revenue?
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setInput("How many clients do I have?");
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                How many clients do I have?
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setInput("What are my most profitable services?");
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                What are my most profitable services?
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setInput("Show me the performance of my technicians");
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                Show me the performance of my technicians
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm"
                onClick={() => {
                  setInput("What is my business analytics summary?");
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                What is my business analytics summary?
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Business Metrics Help</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Ask about specific metrics</p>
              <p>• Inquire about revenue trends</p>
              <p>• Get insights on client acquisition</p>
              <p>• Learn about service efficiency</p>
              <p>• Understand technician performance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default AiAssistantPage;
