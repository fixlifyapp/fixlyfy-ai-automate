
import { MessageSquare, Sparkles, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageInputInline } from "@/components/messages/components/MessageInputInline";
import { useInlineMessaging } from "@/components/messages/hooks/useInlineMessaging";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
}

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  messages: Message[];
}

interface ConversationThreadProps {
  conversation: Conversation | undefined;
  onMessagesUpdate?: () => void;
}

export const ConversationThread = ({ conversation, onMessagesUpdate }: ConversationThreadProps) => {
  const { sendMessage, isSending } = useInlineMessaging({
    clientId: conversation?.client.id,
    clientPhone: conversation?.client.phone,
    onMessageSent: onMessagesUpdate
  });

  // Format messages for AI
  const unifiedMessages = conversation?.messages.map(msg => ({
    id: msg.id,
    body: msg.text,
    direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
    created_at: msg.timestamp,
    sender: msg.sender
  })) || [];

  const handleUseSuggestion = (content: string) => {
    // This will be handled by the MessageInputInline component
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: unifiedMessages,
    client: conversation?.client || { name: "", id: "" },
    jobId: '', // No job context in connect center
    onUseSuggestion: handleUseSuggestion
  });
  
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MessageSquare className="h-16 w-16 mb-4 text-fixlyfy-text-muted" />
        <h3 className="text-xl font-medium mb-2">Messaging Center</h3>
        <p className="text-center text-fixlyfy-text-secondary max-w-sm mb-4">
          Select a conversation to view messages.
        </p>
      </div>
    );
  }

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const shouldShowSuggest = lastMessage?.isClient;

  return (
    <>
      <div className="p-4 border-b border-fixlyfy-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{conversation.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{conversation.client.name}</h3>
              <p className="text-xs text-fixlyfy-text-secondary">
                {conversation.client.phone || "No phone number"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSuggestResponse}
              disabled={isAILoading || conversation.messages.length === 0}
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
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {conversation.messages.length > 0 ? (
          conversation.messages.map((message) => {
            const isFromClient = message.isClient;
            const senderName = isFromClient ? conversation.client.name : 'You';
            const senderInitials = isFromClient 
              ? conversation.client.name.substring(0, 2).toUpperCase()
              : 'ME';

            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex gap-3",
                  !isFromClient && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-xs",
                    isFromClient ? "bg-muted" : "bg-fixlyfy text-white"
                  )}>
                    {senderInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[80%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-lg",
                    isFromClient 
                      ? "bg-muted text-foreground" 
                      : "bg-fixlyfy text-white"
                  )}>
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {senderName} • {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full text-fixlyfy-text-secondary">
            <p>No messages in this conversation yet</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-fixlyfy-border">
        {conversation.client.phone ? (
          <MessageInputInline
            onSendMessage={sendMessage}
            isLoading={isSending}
            showSuggestResponse={true}
            onSuggestResponse={handleSuggestResponse}
            isAILoading={isAILoading}
            placeholder={`Message ${conversation.client.name}...`}
            clientInfo={conversation.client}
            messages={unifiedMessages}
          />
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No phone number available for this client
            </p>
          </div>
        )}
      </div>
    </>
  );
};
