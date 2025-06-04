
import { useState, useEffect } from "react";
import { ConversationsList } from "./components/ConversationsList";
import { ConversationThread } from "./components/ConversationThread";
import { useConversations } from "./hooks/useConversations";
import { useMessageContext } from "@/contexts/MessageContext";

interface DispatcherMessagesViewProps {
  searchResults?: any[];
}

export const DispatcherMessagesView = ({ searchResults = [] }: DispatcherMessagesViewProps) => {
  const {
    conversations,
    refreshConversations,
    isLoading,
    activeConversation,
    handleConversationClick
  } = useConversations();

  const { openMessageDialog } = useMessageContext();
  const [selectedClientFromSearch, setSelectedClientFromSearch] = useState<any>(null);

  // Handle client selection from search
  const handleClientSelect = async (client: { id: string; name: string; phone?: string; email?: string }) => {
    console.log('Client selected from search:', client);
    setSelectedClientFromSearch(client);
    
    // Open message dialog for the selected client
    await openMessageDialog(client);
    
    // Try to find existing conversation for this client
    const existingConv = conversations.find(conv => conv.client.id === client.id);
    if (existingConv) {
      handleConversationClick(existingConv.id);
    }
  };

  // Filter conversations based on search results if provided
  const filteredConversations = searchResults.length > 0 
    ? conversations.filter(conv => 
        searchResults.some(result => result.id === conv.client.id)
      )
    : conversations;

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
      {/* Left Panel - Conversations List */}
      <div className="fixlyfy-card p-0 flex flex-col">
        <div className="p-4 border-b border-fixlyfy-border">
          <h3 className="font-medium">Conversations</h3>
          <p className="text-sm text-fixlyfy-text-secondary">
            {filteredConversations.length} active conversations
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ConversationsList
            conversations={filteredConversations}
            activeConversation={activeConversation}
            isLoading={isLoading}
            onConversationClick={(conversation) => handleConversationClick(conversation.id)}
            onClientSelect={handleClientSelect}
          />
        </div>
      </div>

      {/* Right Panel - Message Thread */}
      <div className="fixlyfy-card p-0 flex flex-col">
        <ConversationThread conversation={activeConv} />
      </div>
    </div>
  );
};
