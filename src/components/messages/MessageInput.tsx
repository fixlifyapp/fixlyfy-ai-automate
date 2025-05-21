
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
}

export const MessageInput = ({ 
  message, 
  setMessage, 
  handleSendMessage, 
  isLoading,
  isDisabled = false
}: MessageInputProps) => {
  return (
    <div className="flex gap-2">
      <textarea 
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
        placeholder="Type your message..."
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading || isDisabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      <Button 
        onClick={handleSendMessage} 
        disabled={isLoading || !message.trim() || isDisabled}
        className="self-end"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </Button>
    </div>
  );
};
