
import { useState } from "react";
import { ConversationsList } from "./components/ConversationsList";
import { ConversationThread } from "./components/ConversationThread";
import { useConversations } from "./hooks/useConversations";

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
