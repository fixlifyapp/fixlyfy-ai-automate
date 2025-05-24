
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles, User, Building2, Briefcase } from "lucide-react";
import { useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { UnifiedMessageList } from "./UnifiedMessageList";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { MessageTextEnhancer } from "@/components/connect/components/MessageTextEnhancer";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";

export const UnifiedMessageDialog = () => {
  const {
    activeConversation,
    isMessageDialogOpen,
    closeMessageDialog,
    sendMessage,
    isSending
  } = useMessageContext();
  
  const { user } = useAuth();
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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
        
        {/* Client and Sender Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Client Information */}
          <Card className="border-fixlyfy-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-fixlyfy" />
                <span className="font-medium text-sm">Client Information</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{client.name}</div>
                {client.phone && (
                  <div className="text-muted-foreground">📞 {client.phone}</div>
                )}
                {client.email && (
                  <div className="text-muted-foreground">✉️ {client.email}</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Sender Information */}
          <Card className="border-fixlyfy-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-fixlyfy" />
                <span className="font-medium text-sm">Sending As</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{user?.user_metadata?.full_name || user?.email || 'You'}</div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Fixlyfy Team
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <UnifiedMessageList 
              messages={activeConversation.messages}
              isLoading={false}
              clientName={client.name}
              clientInfo={client}
            />
          </div>
          
          {/* Message Composition Area - Fixed at bottom */}
          <div className="flex-shrink-0 border-t pt-4 space-y-3">
            {shouldShowSuggest && (
              <div className="flex justify-end">
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
              </div>
            )}
            
            {/* Message Input Area */}
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea 
                  className="w-full p-3 pr-12 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none resize-none min-h-[80px] max-h-[120px]" 
                  placeholder={`Type your message to ${client.name}... (Press Shift+Enter for new line, Enter to send)`}
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
              <Button 
                onClick={handleSend} 
                disabled={isSending || !messageText.trim()}
                size="lg"
                className="px-6 h-[80px] flex flex-col gap-1"
              >
                <Send size={18} />
                <span className="text-xs">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
