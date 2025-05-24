
import { Loader2, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
  showSuggestResponse?: boolean;
  onSuggestResponse?: () => void;
  isAILoading?: boolean;
  clientInfo?: {
    name: string;
    phone?: string;
    id?: string;
  };
  messages?: any[];
}

export const MessageInput = ({ 
  message, 
  setMessage, 
  handleSendMessage, 
  isLoading,
  isDisabled = false,
  showSuggestResponse = false,
  onSuggestResponse,
  isAILoading = false,
  clientInfo,
  messages = []
}: MessageInputProps) => {
  const canSuggestResponse = showSuggestResponse && onSuggestResponse && messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const shouldShowSuggest = canSuggestResponse && lastMessage?.direction === 'inbound';

  return (
    <div className="space-y-2">
      {shouldShowSuggest && (
        <div className="flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            onClick={onSuggestResponse}
            disabled={isAILoading || isLoading}
            className="gap-2 text-purple-600 border-purple-200"
          >
            {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            {isAILoading ? "Generating..." : "Suggest Response"}
          </Button>
        </div>
      )}
      
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
    </div>
  );
};
