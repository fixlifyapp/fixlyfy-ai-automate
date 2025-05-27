import { useState } from "react";
import { useConversations } from "./hooks/useConversations";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import { ConversationsList } from "./components/ConversationsList";
import { ConnectMessageDialog } from "./components/ConnectMessageDialog";
import { useMessageContext } from "@/contexts/MessageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

  useRealTimeMessaging({
    onNewMessage: refreshConversations,
    enabled: true
  });

  const handleConversationSelect = (conversation: any) => {
    try {
      setSelectedConversation(conversation);
      if (handleConversationClick) {
        handleConversationClick(conversation.id);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedConversation(null);
    closeMessageDialog();
  };

  const filteredConversations = searchResults && searchResults.length > 0 
    ? conversations.filter(conv => 
        searchResults.some(result => result.id === conv.client.id)
      )
    : conversations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-fixlyfy-text-secondary">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-fixlyfy-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-fixlyfy" />
            Client Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{filteredConversations.length} active conversation(s)</span>
            </div>
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-sm">Start messaging your clients to see conversations here</p>
            </div>
          ) : (
            <div className="border border-fixlyfy-border rounded-lg overflow-hidden">
              <ConversationsList
                conversations={filteredConversations}
                onConversationClick={handleConversationSelect}
                activeConversation={activeConversation}
                isLoading={false}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ConnectMessageDialog
        isOpen={isMessageDialogOpen}
        onClose={handleCloseDialog}
        conversation={selectedConversation}
      />
    </div>
  );
};
