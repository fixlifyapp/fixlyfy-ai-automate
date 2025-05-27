
import { useState } from "react";
import { useConversations } from "./hooks/useConversations";
import { ConversationsList } from "./components/ConversationsList";
import { ConversationThread } from "./components/ConversationThread";

export const DispatcherMessagesView = () => {
  const {
    conversations,
    isLoading,
    activeConversation,
    handleConversationClick
  } = useConversations();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    handleConversationClick(conversationId);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-[600px] border border-fixlyfy-border rounded-lg overflow-hidden">
      {/* Left Side - Conversations List */}
      <div className="w-1/3 border-r border-fixlyfy-border bg-white">
        <div className="p-4 border-b border-fixlyfy-border">
          <h3 className="font-semibold text-lg">Client Conversations</h3>
          <p className="text-sm text-gray-600">Select a conversation to view messages</p>
        </div>
        
        <div className="overflow-y-auto h-full">
          <ConversationsList
            conversations={conversations}
            activeConversation={selectedConversationId}
            isLoading={isLoading}
            onConversationClick={(conversation) => handleSelectConversation(conversation.id)}
          />
        </div>
      </div>

      {/* Right Side - Conversation Thread */}
      <div className="flex-1 flex flex-col">
        <ConversationThread conversation={selectedConversation} />
      </div>
    </div>
  );
};
