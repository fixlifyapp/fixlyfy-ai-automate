
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { UnifiedMessageList } from "./UnifiedMessageList";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { MessageTextEnhancer } from "@/components/connect/components/MessageTextEnhancer";

export const UnifiedMessageDialog = () => {
  const {
    activeConversation,
    isMessageDialogOpen,
    closeMessageDialog,
    sendMessage,
    isSending
  } = useMessageContext();
  
  const [messageText, setMessageText] = useState("");

  const handleUseSuggestion = (content: string) => {
    setMessageText(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: activeConversation?.messages || [],
    client: activeConversation?.client || { name: "", id: "" },
    jobId: '', // No job context in unified dialog
    onUseSuggestion: handleUseSuggestion
  });

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;
    
    await sendMessage(messageText);
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) return null;

  const client = activeConversation.client;
  const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
  const shouldShowSuggest = lastMessage?.direction === 'inbound';

  return (
    <Dialog open={isMessageDialogOpen} onOpenChange={closeMessageDialog}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Message {client.name}
            {client.phone && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({client.phone})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto">
            <UnifiedMessageList 
              messages={activeConversation.messages}
              isLoading={false}
              clientName={client.name}
              clientInfo={client}
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
                  className="w-full p-3 pr-12 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none resize-y min-h-[100px]" 
                  placeholder="Type your message... (Press Shift+Enter for new line, Enter to send)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSending}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-2 top-2">
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
