
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { MessageList } from "@/components/assistant/MessageList";
import { MessageInput } from "@/components/assistant/MessageInput";
import { SavedPrompts } from "@/components/assistant/SavedPrompts";
import { SavePromptDialog } from "@/components/assistant/SavePromptDialog";
import { Message, SavedPrompt } from "@/types/assistant";
import { sampleMessages, sampleSavedPrompts } from "@/data/assistantData";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(sampleSavedPrompts);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setCurrentPrompt(content);
    simulateResponse(content);
  };

  const simulateResponse = (userMessage: string) => {
    setIsLoading(true);

    const loadingMessage: Message = {
      id: uuidv4(),
      content: "",
      role: "assistant",
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setMessages((prev) => [...prev, loadingMessage]);

    // Simulate API response delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Simulated responses based on user input
      let responseContent = "I'm not sure how to help with that specific request. Could you provide more details?";
      
      if (userMessage.toLowerCase().includes("invoice")) {
        responseContent = "To create an invoice, go to the Jobs section, select the job, and click on Create Invoice. You'll be able to add line items and customize the invoice before sending it to the client.";
      } else if (userMessage.toLowerCase().includes("customer") || userMessage.toLowerCase().includes("client")) {
        responseContent = "For customer management, use the Clients section where you can add new clients, view their history, and manage their contact information.";
      } else if (userMessage.toLowerCase().includes("schedule")) {
        responseContent = "The Schedule page allows you to view and manage appointments. You can filter by technician, date range, and job type to optimize your team's workload.";
      } else if (userMessage.toLowerCase().includes("payment")) {
        responseContent = "Payments are processed in the Finance section. You can record new payments, view transaction history, and process refunds if needed.";
      }
      
      const newAssistantMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
    }, 1500);
  };

  const handleSavePrompt = (title: string, prompt: string) => {
    const newSavedPrompt: SavedPrompt = {
      id: uuidv4(),
      title,
      content: prompt,
      timestamp: new Date().toISOString()
    };
    
    setSavedPrompts((prev) => [newSavedPrompt, ...prev]);
    toast({
      title: "Prompt saved",
      description: "Your prompt has been saved successfully."
    });
  };
  
  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };
  
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // In a real app, this would be sent to the backend
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
    toast({
      title: "Thank you for your feedback!",
      description: isPositive ? "We're glad this was helpful." : "We'll work on improving this response."
    });
  };
  
  // Scroll to bottom on new messages
  useEffect(() => {
    const messageContainer = document.querySelector('.message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);
  
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">Get AI help with managing your service business</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <div className="lg:col-span-1 border rounded-lg overflow-hidden">
          <Tabs defaultValue="saved">
            <div className="border-b p-2">
              <TabsList className="w-full">
                <TabsTrigger value="saved" className="w-full">Saved Prompts</TabsTrigger>
                <TabsTrigger value="history" className="w-full">History</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="saved" className="h-[calc(100%-50px)]">
              <SavedPrompts 
                savedPrompts={savedPrompts} 
                onSelectPrompt={handleSelectPrompt}
              />
            </TabsContent>
            
            <TabsContent value="history" className="h-[calc(100%-50px)]">
              <div className="p-4">
                <p className="text-center text-muted-foreground">Coming soon: Conversation history</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-2 border rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-muted/50">
            <h2 className="text-sm font-medium">AI Assistant</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto message-container">
            <MessageList messages={messages} />
          </div>
          
          <div className="border-t">
            {messages.length > 1 && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].isLoading && (
              <div className="flex justify-between items-center p-2 px-4 border-b">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFeedback(messages[messages.length - 1].id, true)}
                  >
                    <ThumbsUp size={16} className="mr-1" />
                    Helpful
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFeedback(messages[messages.length - 1].id, false)}
                  >
                    <ThumbsDown size={16} className="mr-1" />
                    Not helpful
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSaveDialogOpen(true)}
                >
                  <Star size={16} className="mr-1" />
                  Save
                </Button>
              </div>
            )}
            <MessageInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <SavePromptDialog 
        open={isSaveDialogOpen} 
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSavePrompt}
        defaultPrompt={currentPrompt}
      />
    </PageLayout>
  );
}
