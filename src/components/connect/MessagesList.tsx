
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useConversations } from "./hooks/useConversations";
import { ConversationsList } from "./components/ConversationsList";
import { ConversationThread } from "./components/ConversationThread";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import { useMessageContext } from "@/contexts/MessageContext";

interface MessagesListProps {
  searchResults?: any[];
}

export const MessagesList = ({ searchResults = [] }: MessagesListProps) => {
  const { openMessageDialog } = useMessageContext();
  
  const {
    conversations,
    activeConversation,
    isLoading,
    handleConversationClick,
    refreshConversations
  } = useConversations();

  // Use real-time messaging hook to refresh conversations on new messages
  useRealTimeMessaging({
    onNewMessage: refreshConversations
  });

  const handleNewMessageClick = (client: any) => {
    openMessageDialog(client);
  };

  // Handle search result click - either select an existing conversation or start a new one
  const handleSearchResultClick = (result: any) => {
    if (result.type === 'conversation') {
      // Find the conversation and set it as active
      handleConversationClick(result.sourceId);
    } else {
      // For client or job results, open the message dialog with that client
      handleNewMessageClick({
        id: result.id,
        name: result.name,
        phone: result.phone
      });
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);
  
  // Filter conversations based on search results if we have any
  const filteredConversations = searchResults.length > 0 
    ? conversations.filter(conv => 
        searchResults.some(result => 
          (result.type === 'conversation' && result.sourceId === conv.id) ||
          (result.id === conv.client.id)
        )
      )
    : conversations;

  return (
    <div className="space-y-4">
      {/* Search Results Information */}
      {searchResults.length > 0 && (
        <div className="text-sm text-fixlyfy-text-secondary">
          Found {searchResults.length} results. Showing relevant conversations.
        </div>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="p-0">
          <div className="p-4 border-b border-fixlyfy-border">
            <h3 className="font-medium">Recent Messages</h3>
          </div>
          
          <div className="h-[600px] overflow-y-auto">
            <ConversationsList
              conversations={filteredConversations}
              activeConversation={activeConversation}
              isLoading={isLoading}
              onConversationClick={handleConversationClick}
            />
          </div>
        </Card>
        
        {/* Message Thread */}
        <Card className="p-0 md:col-span-2">
          <div className="h-[600px] flex flex-col">
            <ConversationThread conversation={activeConv} />
          </div>
        </Card>
      </div>
    </div>
  );
};
