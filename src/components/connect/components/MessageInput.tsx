
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip } from "lucide-react";

interface MessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const MessageInput = ({ selectedConversation, onMessageSent }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = async () => {
    // Placeholder for future implementation
    console.log('Message functionality removed');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 p-4 border-t border-fixlyfy-border/50">
        <div className="h-full flex flex-col gap-3">
          <div className="flex-1 flex gap-3">
            <div className="flex-1">
              <Textarea
                placeholder={`SMS functionality has been removed`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={true}
                className="h-full resize-none border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="p-2 border-fixlyfy-border hover:bg-fixlyfy/5"
                disabled={true}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={true}
                className="px-4 py-2 bg-fixlyfy hover:bg-fixlyfy-light text-white"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-fixlyfy-text-muted">
            <span>SMS functionality has been removed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
