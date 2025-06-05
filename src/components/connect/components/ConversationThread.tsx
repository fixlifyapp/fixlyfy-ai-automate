
import { MessageSquare, Send, Phone, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center max-w-md px-6">
            <div className="bg-white rounded-full p-6 mb-6 shadow-lg inline-block">
              <MessageSquare className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Select a conversation
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Choose a conversation from the left panel to start viewing and sending messages to your clients.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {conversation.client.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{conversation.client.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {conversation.client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{conversation.client.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {conversation.client.phone && (
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <UnifiedMessageList 
            messages={formattedMessages}
            isLoading={false}
            clientName={conversation.client.name}
          />
        </div>
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleFormSubmit}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea 
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none transition-all duration-200" 
                placeholder="Type your message..."
                rows={3}
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
            <Button 
              type="submit"
              disabled={isSending || !messageText.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
