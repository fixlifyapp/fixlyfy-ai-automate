
import { useState } from "react";
import { Loader2, Send, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputInlineProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isDisabled?: boolean;
  showSuggestResponse?: boolean;
  onSuggestResponse?: () => void;
  isAILoading?: boolean;
  placeholder?: string;
  clientInfo?: {
    name: string;
    phone?: string;
    id?: string;
  };
  messages?: any[];
}

export const MessageInputInline = ({ 
  onSendMessage,
  isLoading,
  isDisabled = false,
  showSuggestResponse = false,
  onSuggestResponse,
  isAILoading = false,
  placeholder = "Type your message...",
  clientInfo,
  messages = []
}: MessageInputInlineProps) => {
  const [message, setMessage] = useState("");

  const canSuggestResponse = showSuggestResponse && onSuggestResponse && messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const shouldShowSuggest = canSuggestResponse && lastMessage?.direction === 'inbound';

  const handleSend = async () => {
    if (!message.trim() || isLoading || isDisabled) return;
    
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestClick = () => {
    if (onSuggestResponse) {
      onSuggestResponse();
    }
  };

  return (
    <div className="space-y-3 border-t pt-4">
      {shouldShowSuggest && (
        <div className="flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSuggestClick}
            disabled={isAILoading || isLoading}
            className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            {isAILoading ? (
              <>
                <Bot className="h-4 w-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Response
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <Textarea 
          className="min-h-[60px] resize-none" 
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading || isDisabled}
          onKeyDown={handleKeyDown}
        />
        <Button 
          onClick={handleSend}
          disabled={isLoading || !message.trim() || isDisabled}
          size="sm"
          className="self-end"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
