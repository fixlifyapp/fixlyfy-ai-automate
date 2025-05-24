
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useConversations } from "./hooks/useConversations";
import { ConversationsList } from "./components/ConversationsList";
import { useRealTimeMessaging } from "./hooks/useRealTimeMessaging";
import { useMessageContext } from "@/contexts/MessageContext";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";
import { MessageTextEnhancer } from "./components/MessageTextEnhancer";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles } from "lucide-react";

interface MessagesListProps {
  searchResults?: any[];
}

export const MessagesList = ({ searchResults = [] }: MessagesListProps) => {
  const { sendMessage, isSending } = useMessageContext();
  const [messageText, setMessageText] = useState("");
  
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

  const handleUseSuggestion = (content: string) => {
    setMessageText(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: activeConv?.messages || [],
    client: activeConv?.client || { name: "", id: "" },
    jobId: '', // No job context in connect center
    onUseSuggestion: handleUseSuggestion
  });

  const handleSend = async () => {
    if (!messageText.trim() || isSending || !activeConv) return;
    
    await sendMessage(messageText);
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Convert Message[] to UnifiedMessage[] format
  const convertMessagesToUnified = (messages: any[]) => {
    return messages.map(msg => ({
      id: msg.id,
      body: msg.text,
      direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
      created_at: msg.timestamp,
      sender: msg.sender,
      recipient: undefined
    }));
  };

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
        
        {/* Integrated Message Interface */}
        <Card className="p-0 md:col-span-2">
          <div className="h-[600px] flex flex-col">
            {activeConv ? (
              <>
                {/* Header with client info */}
                <div className="p-4 border-b border-fixlyfy-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-lg">
                        Message {activeConv.client.name}
                        {activeConv.client.phone && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({activeConv.client.phone})
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <UnifiedMessageList 
                    messages={convertMessagesToUnified(activeConv.messages)}
                    isLoading={false}
                    clientName={activeConv.client.name}
                    clientInfo={activeConv.client}
                  />
                </div>
                
                {/* Message Input Area */}
                <div className="flex-shrink-0 p-4 border-t border-fixlyfy-border space-y-3">
                  <div className="flex justify-between items-center">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSuggestResponse}
                      disabled={isAILoading || isSending}
                      className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      {isAILoading ? (
                        <>
                          <Bot className="h-4 w-4 animate-pulse" />
                          Generating Response...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          AI Response
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleSend} 
                      disabled={isSending || !messageText.trim()}
                      size="sm"
                      className="px-4"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <textarea 
                        className="w-full p-4 pr-12 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-y min-h-[120px] text-base" 
                        placeholder="Type your message... (Press Shift+Enter for new line, Enter to send)"
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
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                  <p className="text-fixlyfy-text-secondary max-w-sm">
                    Select a conversation from the list to view messages and start chatting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
