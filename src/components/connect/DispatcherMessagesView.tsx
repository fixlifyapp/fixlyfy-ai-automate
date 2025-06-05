
import { useState, useEffect } from "react";
import { ConversationsList } from "./components/ConversationsList";
import { ConversationThread } from "./components/ConversationThread";
import { useConversations } from "./hooks/useConversations";
import { useMessageContext } from "@/contexts/MessageContext";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
    
    // Open message dialog for the selected client - ensure phone is provided
    await openMessageDialog({
      id: client.id,
      name: client.name,
      phone: client.phone || '', // Provide empty string if phone is undefined
      email: client.email || ''
    });
    
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
    <div className="h-[600px] border border-fixlyfy-border rounded-lg overflow-hidden bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Conversations List */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-fixlyfy-border bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-900">Conversations</h3>
              <p className="text-sm text-gray-600 mt-1">
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Message Thread */}
        <ResizablePanel defaultSize={70} minSize={55} maxSize={75}>
          <div className="h-full flex flex-col bg-gray-50">
            <ConversationThread conversation={activeConv} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
