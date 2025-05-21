
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone?: string;
  };
}

export const MessageDialog = ({ open, onOpenChange, client }: MessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! Just confirming our appointment tomorrow at 1:30 PM.",
      sender: "You",
      timestamp: "May 14 9:30 AM",
      isClient: false
    },
    {
      text: "Yes, I'll be there. Thank you for the reminder.",
      sender: client.name,
      timestamp: "May 14 10:15 AM",
      isClient: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsLoading(true);

    try {
      // Add the new message to the local list
      const newMessage = {
        text: message,
        sender: "You",
        timestamp: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
        isClient: false
      };

      setMessages([...messages, newMessage]);
      
      // Send SMS via Twilio edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: client.phone,
          body: message
        }
      });
      
      if (error) {
        console.error("Error sending SMS:", error);
        toast.error("Failed to send SMS. Please try again.");
      } else if (data.success) {
        toast.success("Message sent to client");
        setMessage("");
      } else {
        toast.error(`Failed to send SMS: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${msg.isClient ? 'self-end items-end ml-auto' : ''}`}
              >
                <div 
                  className={`${
                    msg.isClient 
                      ? 'bg-fixlyfy text-white' 
                      : 'bg-muted'
                  } p-3 rounded-lg max-w-[80%] ${msg.isClient ? 'ml-auto' : ''}`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary mt-1">
                  {msg.sender}, {msg.timestamp}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <textarea 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
              placeholder="Type your message..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
