
import { MessageSquare, Sparkles, Bot, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMessageContext } from "@/contexts/MessageContext";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { useConversationMessaging } from "../hooks/useConversationMessaging";
import { MessageTextEnhancer } from "./MessageTextEnhancer";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";

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
}

export const ConversationThread = ({ conversation }: ConversationThreadProps) => {
  // Format messages for AI
  const unifiedMessages = conversation?.messages.map(msg => ({
    id: msg.id,
    body: msg.text,
    direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
    created_at: msg.timestamp,
    sender: msg.sender
  })) || [];

  const handleUseSuggestion = (content: string) => {
    if (conversation?.id) {
      setMessageText(content);
    }
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: unifiedMessages,
    client: conversation?.client || { name: "", id: "" },
    jobId: '', // No job context in connect center
    onUseSuggestion: handleUseSuggestion
  });

  const {
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyDown,
    isSending
  } = useConversationMessaging({
    conversationId: conversation?.id || "",
    clientPhone: conversation?.client.phone,
    clientId: conversation?.client.id
  });

  // Prevent form submission and page refresh
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Format messages for UnifiedMessageList - properly map to UnifiedMessage interface
  const formattedMessages = conversation?.messages.map(msg => ({
    id: msg.id,
    body: msg.text,
    direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
    created_at: msg.timestamp,
    sender: msg.sender
  })) || [];
  
  if (!conversation) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-fixlyfy-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-fixlyfy-text-muted" />
            <div>
              <h3 className="font-medium">Start a new conversation</h3>
              <p className="text-sm text-fixlyfy-text-secondary">
                Type a message to begin chatting
              </p>
            </div>
          </div>
        </div>

        {/* Empty state with integrated messaging */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mb-4 text-fixlyfy-text-muted mx-auto" />
              <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
              <p className="text-fixlyfy-text-secondary max-w-sm">
                Select a conversation from the list to view messages, or start typing below to begin a new conversation.
              </p>
            </div>
          </div>

          {/* Message input for new conversations */}
          <div className="p-4 border-t border-fixlyfy-border">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <textarea 
                  className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none resize-none" 
                  placeholder="Type your message to start a new conversation..."
                  rows={2}
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
              <div className="flex flex-col gap-2">
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
                      AI
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI
                    </>
                  )}
                </Button>
                <Button 
                  type="submit"
                  disabled={isSending || !messageText.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const shouldShowSuggest = lastMessage?.isClient;

  return (
    <>
      <div className="p-4 border-b border-fixlyfy-border">
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
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <UnifiedMessageList 
          messages={formattedMessages}
          isLoading={false}
          clientName={conversation.client.name}
        />
      </div>
      
      <div className="p-4 border-t border-fixlyfy-border">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea 
              className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none resize-none" 
              placeholder="Type your message..."
              rows={2}
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
          <div className="flex flex-col gap-2">
            {shouldShowSuggest && (
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
                    AI
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI
                  </>
                )}
              </Button>
            )}
            <Button 
              type="submit"
              disabled={isSending || !messageText.trim()}
              size="sm"
              className="px-3"
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
