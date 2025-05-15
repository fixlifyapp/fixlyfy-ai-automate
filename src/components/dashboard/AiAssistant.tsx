
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon, Bot, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you schedule that job. What time works best for the client?",
        "Based on your schedule, tomorrow morning would be the best time to fit in this new job.",
        "Let me analyze that for you. Your top performing service this month is HVAC with a 24% increase in revenue.",
        "I've found 3 technicians available for this job. David has the highest rating for this type of work.",
        "I can help you create an estimate for this job. What services will be included?"
      ];
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: responses[Math.floor(Math.random() * responses.length)],
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="bg-fixlyfy">
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
