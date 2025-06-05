
import { MessageSquare, Send, Phone, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useConversationMessaging } from "../hooks/useConversationMessaging";
import { MessageTextEnhancer } from "./MessageTextEnhancer";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";
import { CallDialog } from "../CallDialog";
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  
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

  const handleCallClick = () => {
    if (conversation?.client.phone) {
      setCallDialogOpen(true);
    }
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
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-white">
          <div className="text-center max-w-md px-6">
            <div className="bg-white rounded-full p-6 mb-6 shadow-lg inline-block border border-fixlyfy/10">
              <MessageSquare className="h-12 w-12 text-fixlyfy" />
            </div>
            <h3 className="text-xl font-semibold text-fixlyfy-text mb-3">
              Select a conversation
            </h3>
            <p className="text-fixlyfy-text-secondary leading-relaxed">
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
      <div className="bg-gradient-to-r from-white to-fixlyfy-bg-interface border-b border-fixlyfy-border/50 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-fixlyfy/10">
            <AvatarFallback className="bg-gradient-to-br from-fixlyfy to-fixlyfy-light text-white font-semibold">
              {conversation.client.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-fixlyfy-text">{conversation.client.name}</h3>
            <div className="flex items-center gap-4 text-sm text-fixlyfy-text-secondary">
              {conversation.client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-fixlyfy" />
                  <span>{conversation.client.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {conversation.client.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-fixlyfy/30 text-fixlyfy hover:bg-gradient-to-r hover:from-fixlyfy hover:to-fixlyfy-light hover:text-white transition-all duration-200 shadow-sm"
                onClick={handleCallClick}
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Resizable Content Area */}
      <div className="flex-1 bg-fixlyfy-bg-interface overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Messages Area */}
          <ResizablePanel defaultSize={60} minSize={30} maxSize={80}>
            <div className="h-full overflow-y-auto bg-gradient-to-b from-fixlyfy-bg-interface/50 to-white">
              <div className="p-4">
                <UnifiedMessageList 
                  messages={formattedMessages}
                  isLoading={false}
                  clientName={conversation.client.name}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-fixlyfy-border/50 hover:bg-fixlyfy/20 transition-colors" />

          {/* Message Input Area */}
          <ResizablePanel defaultSize={40} minSize={20} maxSize={70}>
            <div className="h-full bg-gradient-to-r from-white to-fixlyfy-bg-interface border-t border-fixlyfy-border/50 p-4 flex flex-col">
              <form onSubmit={handleFormSubmit} className="h-full flex flex-col gap-3">
                <div className="flex-1 relative">
                  <textarea 
                    className="w-full h-full p-4 pr-12 border border-fixlyfy-border/50 rounded-lg focus:ring-2 focus:ring-fixlyfy/50 focus:border-fixlyfy focus:outline-none resize-none transition-all duration-200 bg-white shadow-sm min-h-[120px]" 
                    placeholder="Type your message..."
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
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy-light hover:to-fixlyfy text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Call Dialog */}
      {conversation.client.phone && (
        <CallDialog
          isOpen={callDialogOpen}
          onClose={() => setCallDialogOpen(false)}
          phoneNumber={conversation.client.phone}
        />
      )}
    </>
  );
};
