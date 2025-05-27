
import { MessageSquare, Sparkles, Bot, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

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
        <div className="p-4 border-b border-fixlyfy-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-fixlyfy-text-muted" />
            <div>
              <h3 className="font-medium">Start a new conversation</h3>
              <p className="text-sm text-fixlyfy-text-secondary">
                Select a conversation to view messages
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mb-4 text-fixlyfy-text-muted mx-auto" />
            <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
            <p className="text-fixlyfy-text-secondary max-w-sm">
              Select a conversation from the list to view and send messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <Button 
            type="submit"
            disabled={isSending || !messageText.trim()}
            size="sm"
            className="px-3"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </>
  );
};
