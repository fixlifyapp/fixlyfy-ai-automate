
import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";
import { ClientSearchHeader } from "./ClientSearchHeader";
import { ConversationsList } from "./ConversationsList";
import { MessageThread } from "./MessageThread";
import { MessageInput } from "./MessageInput";

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export const SimpleMessagesInterface = () => {
  const { conversations, refreshConversations, isLoading } = useMessageContext();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  console.log('SimpleMessagesInterface conversations:', conversations);

  // Auto-refresh conversations every 5 seconds to catch new messages
  useEffect(() => {
    const interval = setInterval(() => {
      refreshConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshConversations]);

  const handleClientSelect = async (client: SearchResult) => {
    console.log('Selected client:', client);
    
    // Check if conversation already exists
    let existingConversation = conversations.find(conv => conv.client.id === client.id);
    
    if (existingConversation) {
      // Use existing conversation
      setSelectedConversation(existingConversation);
      console.log('Using existing conversation:', existingConversation.id);
    } else {
      // Create a new conversation placeholder
      const newConversation = {
        id: `temp-${client.id}`,
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone || '',
          email: client.email || ''
        },
        messages: [],
        lastMessage: 'No messages yet',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
      
      setSelectedConversation(newConversation);
      console.log('Created new conversation placeholder for client:', client.name);
    }
  };

  const handleMessageSent = () => {
    refreshConversations();
  };

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Client Search Header */}
      <ClientSearchHeader onClientSelect={handleClientSelect} />

      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={setSelectedConversation}
            isLoading={isLoading}
            onRefresh={refreshConversations}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-gray-200 hover:bg-blue-200 transition-colors" />

        {/* Right Panel - Message Thread and Input */}
        <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <MessageThread selectedConversation={selectedConversation} />
            </div>
            <MessageInput 
              selectedConversation={selectedConversation}
              onMessageSent={handleMessageSent}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
