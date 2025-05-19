
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon, Bot, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { createClient } from "@/integrations/supabase/client";

type Message = {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your AI assistant. How can I help you today with your service business?",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Get AI response from our Edge Function
      const { data, error } = await supabase.functions.invoke("generate-with-ai", {
        body: {
          prompt: input,
          context: "You are an AI assistant for a field service management application called Fixlyfy. Help users with scheduling, service recommendations, business analytics, and technician management. Provide concise, helpful responses focused on service business needs. Reference current data if available."
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: data.generatedText,
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="fixlyfy-gradient rounded-full p-2">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Get real-time help with your business</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[300px]">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex gap-3",
                message.role === "user" && "justify-end"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-fixlyfy text-white">AI</AvatarFallback>
                </Avatar>
              )}
              <div 
                className={cn(
                  "px-3 py-2 rounded-lg max-w-[80%]",
                  message.role === "assistant" 
                    ? "bg-fixlyfy-bg-interface text-fixlyfy-text" 
                    : "bg-fixlyfy text-white"
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
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
              <div className="px-3 py-2 rounded-lg bg-fixlyfy-bg-interface text-fixlyfy-text max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-fixlyfy animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-fixlyfy animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-fixlyfy animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            className="bg-fixlyfy"
            disabled={isLoading}
          >
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
