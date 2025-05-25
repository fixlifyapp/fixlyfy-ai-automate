
import { useState } from "react";
import { useConversations } from "./hooks/useConversations";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import { ConversationsList } from "./components/ConversationsList";
import { ConnectMessageDialog } from "./components/ConnectMessageDialog";
import { useMessageContext } from "@/contexts/MessageContext";

interface MessagesListProps {
  searchResults?: any[];
}

export const MessagesList = ({ searchResults }: MessagesListProps) => {
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const { 
    conversations, 
    refreshConversations, 
    isLoading, 
    activeConversation,
    handleConversationClick 
  } = useConversations();

  const { isMessageDialogOpen, closeMessageDialog } = useMessageContext();

  // Set up real-time messaging with error handling
  useRealTimeMessaging({
    onNewMessage: () => {
      console.log('Real-time update detected, refreshing conversations');
      refreshConversations();
    },
    enabled: true
  });

  const handleConversationSelect = (conversation: any) => {
    console.log('Conversation selected:', conversation);
    try {
      setSelectedConversation(conversation);
      if (handleConversationClick) {
        handleConversationClick(conversation.id);
      } else {
        console.error('handleConversationClick is not available');
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedConversation(null);
    closeMessageDialog();
  };

  // Filter conversations based on search results if provided
  const filteredConversations = searchResults && searchResults.length > 0 
    ? conversations.filter(conv => 
        searchResults.some(result => result.id === conv.client.id)
      )
    : conversations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-fixlyfy-border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Conversations</h2>
            <span className="text-sm text-muted-foreground">
              {filteredConversations.length} conversation(s)
            </span>
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No conversations found</p>
              <p className="text-sm mt-1">Start a new conversation with a client</p>
            </div>
          ) : (
            <ConversationsList
              conversations={filteredConversations}
              onConversationClick={handleConversationSelect}
              activeConversationId={activeConversation}
            />
          )}
        </div>
      </div>

      {/* Unified Message Dialog */}
      <ConnectMessageDialog
        isOpen={isMessageDialogOpen}
        onClose={handleCloseDialog}
        conversation={selectedConversation}
      />
    </div>
  );
};
