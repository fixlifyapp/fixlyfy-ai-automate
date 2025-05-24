
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useConversations } from "./hooks/useConversations";
import { ConversationsList } from "./components/ConversationsList";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ConnectMessageDialog } from "./components/ConnectMessageDialog";

interface MessagesListProps {
  searchResults?: any[];
}

export const MessagesList = ({ searchResults = [] }: MessagesListProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  
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

  // Handle search result click - either select an existing conversation or start a new one
  const handleSearchResultClick = (result: any) => {
    if (result.type === 'conversation') {
      handleConversationClick(result.sourceId);
    } else {
      // For client or job results, find or create conversation
      const existingConv = conversations.find(c => c.client.id === result.id);
      if (existingConv) {
        handleConversationClick(existingConv.id);
      }
    }
  };

  // Filter conversations based on search results if we have any
  const filteredConversations = searchResults.length > 0 
    ? conversations.filter(conv => 
        searchResults.some(result => 
          (result.type === 'conversation' && result.sourceId === conv.id) ||
          (result.id === conv.client.id)
        )
      )
    : conversations;

  const handleConversationSelect = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setIsMessageDialogOpen(true);
      handleConversationClick(conversationId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Results Information */}
      {searchResults.length > 0 && (
        <div className="text-sm text-fixlyfy-text-secondary">
          Found {searchResults.length} results. Showing relevant conversations.
        </div>
      )}
    
      <div className="grid grid-cols-1 gap-6">
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
              onConversationClick={handleConversationSelect}
            />
          </div>
        </Card>
        
        {/* Empty state when no conversation is selected */}
        {!selectedConversation && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
            <p className="text-fixlyfy-text-secondary max-w-sm">
              Choose a conversation from the list above to start messaging with your clients.
            </p>
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <ConnectMessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => {
          setIsMessageDialogOpen(false);
          setSelectedConversation(null);
        }}
        conversation={selectedConversation}
      />
    </div>
  );
};
