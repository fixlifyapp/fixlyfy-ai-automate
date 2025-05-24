
import { Loader2, Send, Bot, Sparkles } from "lucide-react";
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
        <div className="flex flex-col gap-1">
          {canSuggestResponse && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onSuggestResponse}
              disabled={isAILoading || isLoading || messages.length === 0}
              className="gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {isAILoading ? <Bot size={14} className="animate-pulse" /> : <Sparkles size={14} />}
            </Button>
          )}
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !message.trim() || isDisabled}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
