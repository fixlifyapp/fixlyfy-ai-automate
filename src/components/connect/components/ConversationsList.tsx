
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Loader2, RefreshCw, Archive } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface ConversationsListProps {
  conversations: any[];
  selectedConversation: any;
  onConversationSelect: (conversation: any) => void;
  isLoading: boolean;
  onRefresh: () => void;
  hideSearch?: boolean;
}

export const ConversationsList = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading,
  onRefresh,
  hideSearch = false
}: ConversationsListProps) => {
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set());

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return '';
    }
  };

  const handleArchiveConversation = (conversationId: string, clientName: string) => {
    setArchivedConversations(prev => new Set([...prev, conversationId]));
    toast.success(`Conversation with ${clientName} archived`);
    
    // If the archived conversation was selected, clear the selection
    if (selectedConversation?.id === conversationId) {
      onConversationSelect(null);
    }
  };

  // Filter out archived conversations
  const activeConversations = conversations.filter(conv => !archivedConversations.has(conv.id));

  return (
    <div className="h-full flex flex-col">
      {/* Header with refresh */}
      {!hideSearch && (
        <div className="p-4 border-b border-fixlyfy-border bg-fixlyfy-bg-sidebar">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-fixlyfy-text">Conversations</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2 border-fixlyfy-border hover:bg-fixlyfy/5"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-fixlyfy" />
            <p className="text-fixlyfy-text-secondary">Loading conversations...</p>
          </div>
        ) : activeConversations.length === 0 ? (
          <div className="p-6 text-center text-fixlyfy-text-secondary">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-fixlyfy-text-muted" />
            <h3 className="font-medium text-fixlyfy-text mb-1">No conversations</h3>
            <p className="text-sm">Search for a client above to start messaging</p>
          </div>
        ) : (
          <div className="divide-y divide-fixlyfy-border/50">
            {activeConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative transition-all duration-200",
                  selectedConversation?.id === conversation.id && "bg-fixlyfy/10 border-r-4 border-fixlyfy"
                )}
              >
                <div
                  onClick={() => onConversationSelect(conversation)}
                  className="p-4 cursor-pointer hover:bg-fixlyfy/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {conversation.client.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-fixlyfy-text truncate">
                          {conversation.client.name}
                        </h4>
                        <span className="text-xs text-fixlyfy-text-muted flex-shrink-0 ml-2">
                          {conversation.lastMessageTime ? formatMessageTime(conversation.lastMessageTime) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-fixlyfy-text-secondary truncate mb-2">
                        {conversation.lastMessage || 'No messages'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {conversation.client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-fixlyfy-text-muted" />
                              <span className="text-xs text-fixlyfy-text-muted">{conversation.client.phone}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs bg-fixlyfy/10 text-fixlyfy px-2 py-1 rounded-full font-medium">
                          {conversation.messages.length} messages
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Archive button - appears on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveConversation(conversation.id, conversation.client.name);
                    }}
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                    title="Archive conversation"
                  >
                    <Archive className="h-4 w-4 text-fixlyfy-text-muted" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
