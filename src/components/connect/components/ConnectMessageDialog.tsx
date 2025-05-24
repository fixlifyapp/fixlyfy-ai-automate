
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { MessageTextEnhancer } from "./MessageTextEnhancer";

interface ConnectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: any;
}

export const ConnectMessageDialog = ({ isOpen, onClose, conversation }: ConnectMessageDialogProps) => {
  const { sendMessage, isSending } = useMessageContext();
  const [messageText, setMessageText] = useState("");

  const handleUseSuggestion = (content: string) => {
    setMessageText(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: conversation?.messages || [],
    client: conversation?.client || { name: "", id: "" },
    jobId: '', // No job context in connect center
    onUseSuggestion: handleUseSuggestion
  });

  const handleSend = async () => {
    if (!messageText.trim() || isSending || !conversation) return;
    
    await sendMessage(messageText);
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Convert Message[] to UnifiedMessage[] format
  const convertMessagesToUnified = (messages: any[]) => {
    return messages.map(msg => ({
      id: msg.id,
      body: msg.text,
      direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
      created_at: msg.timestamp,
      sender: msg.sender,
      recipient: undefined
    }));
  };

  if (!conversation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Message {conversation.client.name}
            {conversation.client.phone && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({conversation.client.phone})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto">
            <UnifiedMessageList 
              messages={convertMessagesToUnified(conversation.messages)}
              isLoading={false}
              clientName={conversation.client.name}
              clientInfo={conversation.client}
            />
          </div>
          
          <div className="flex-shrink-0 space-y-3">
            <div className="flex justify-between items-center">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSuggestResponse}
                disabled={isAILoading || isSending}
                className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {isAILoading ? (
                  <>
                    <Bot className="h-4 w-4 animate-pulse" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Response
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSend} 
                disabled={isSending || !messageText.trim()}
                size="sm"
                className="px-4"
              >
                <Send size={16} />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea 
                  className="w-full p-4 pr-12 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-y min-h-[120px] text-base" 
                  placeholder="Type your message... (Press Shift+Enter for new line, Enter to send)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSending}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-3 top-3">
                  <MessageTextEnhancer 
                    messageText={messageText}
                    setMessageText={setMessageText}
                    disabled={isSending}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
