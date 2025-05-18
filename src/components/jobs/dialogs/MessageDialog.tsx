
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone?: string;  // Added phone as optional property
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

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add the new message to the list
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
    toast.success("Message sent to client");
    setMessage("");
    
    // Simulate a reply after a delay (in a real app, this would come from the API)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const clientReply = {
          text: "Thanks for the update! I'll check with you later.",
          sender: client.name,
          timestamp: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }),
          isClient: true
        };
        setMessages(prevMessages => [...prevMessages, clientReply]);
      }, 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message History with {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[80%] ${msg.isClient ? 'self-end items-end ml-auto' : ''}`}
              >
                <div 
                  className={`${
                    msg.isClient 
                      ? 'bg-fixlyfy text-white' 
                      : 'bg-muted'
                  } p-3 rounded-lg`}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
