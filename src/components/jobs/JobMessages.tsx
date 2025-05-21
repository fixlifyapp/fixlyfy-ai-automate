
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, PlusCircle, Bot, Loader2 } from "lucide-react";
import { MessageDialog } from "@/components/jobs/dialogs/MessageDialog";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JobMessagesProps {
  jobId: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: "You are an assistant helping with job messaging for a field service company. Keep responses professional, friendly, and concise."
  });
  
  // In a real app, these would be fetched from an API based on jobId
  const [messages, setMessages] = useState([
    {
      id: "msg-001",
      date: "2023-05-15",
      content: "Hello! Just confirming our appointment tomorrow at 1:30 PM.",
      sender: "technician",
      recipient: "client"
    },
    {
      id: "msg-002",
      date: "2023-05-15",
      content: "Yes, I'll be there. Thank you for the reminder.",
      sender: "client",
      recipient: "technician"
    }
  ]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSuggestResponse = async () => {
    if (isAILoading) return;
    
    try {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "technician") {
        toast.info("Waiting for client response before suggesting a reply.");
        return;
      }
      
      const prompt = `Generate a professional response to this customer message: "${lastMessage.content}"`;
      const suggestedResponse = await generateText(prompt);
      
      if (suggestedResponse) {
        toast.success("AI suggestion ready", {
          description: suggestedResponse,
          action: {
            label: "Use",
            onClick: () => {
              handleUseSuggestion(suggestedResponse);
            }
          }
        });
      }
    } catch (error) {
      toast.error("Failed to generate response suggestion");
    }
  };
  
  const handleUseSuggestion = async (content: string) => {
    setIsSendingMessage(true);
    
    try {
      // In a real app, client info would be fetched based on jobId
      const clientPhone = "(555) 123-4567"; // Example phone number
      
      // Call the Twilio edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: clientPhone,
          body: content
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        const newMessage = {
          id: `msg-${Date.now()}`,
          date: new Date().toISOString(),
          content: content,
          sender: "technician",
          recipient: "client"
        };
        
        setMessages([...messages, newMessage]);
        toast.success("Message sent to client");
      } else {
        toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message to client");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Messages</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleSuggestResponse}
              disabled={isAILoading || isSendingMessage}
              className="gap-2"
            >
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              {isAILoading ? "Thinking..." : "Suggest Response"}
            </Button>
            <Button 
              onClick={() => setIsMessageDialogOpen(true)} 
              className="gap-2"
              disabled={isSendingMessage}
            >
              <PlusCircle size={16} />
              New Message
            </Button>
          </div>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'technician' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'technician' 
                      ? 'bg-muted text-foreground' 
                      : 'bg-fixlyfy text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs text-fixlyfy-text-secondary block mt-1">
                    {new Date(message.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p>No messages yet. Send your first message.</p>
          </div>
        )}
        
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          client={{
            name: "Michael Johnson",
            phone: "(555) 123-4567"
          }}
        />
      </CardContent>
    </Card>
  );
};
