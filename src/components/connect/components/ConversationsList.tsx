
import { Loader2, MessageSquare, Phone, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  isLoading: boolean;
  onConversationClick: (conversation: Conversation) => void;
  onClientSelect?: (client: { id: string; name: string; phone?: string; email?: string }) => void;
}

export const ConversationsList = ({
  conversations,
  activeConversation,
  isLoading,
  onConversationClick,
  onClientSelect
}: ConversationsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-fixlyfy mx-auto mb-2" />
          <p className="text-sm text-fixlyfy-text-secondary">Loading conversations...</p>
        </div>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-fixlyfy-text-secondary p-6">
        <div className="bg-fixlyfy-bg-interface rounded-full p-4 mb-4">
          <MessageSquare className="h-8 w-8 text-fixlyfy" />
        </div>
        <h3 className="font-medium text-fixlyfy-text mb-2">No conversations found</h3>
        <p className="text-sm text-center max-w-xs">
          Search for a client above or start a new conversation to see messages here
        </p>
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffHours * 60)}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="divide-y divide-fixlyfy-border">
      {conversations.map((conversation) => (
        <div 
          key={conversation.id}
          onClick={() => onConversationClick(conversation)}
          className={cn(
            "p-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-fixlyfy/5 hover:to-fixlyfy-light/5",
            activeConversation === conversation.id && "bg-gradient-to-r from-fixlyfy/10 to-fixlyfy-light/10 border-r-4 border-fixlyfy"
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                {conversation.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-fixlyfy-text truncate text-sm">
                  {conversation.client.name}
                </h3>
                <div className="flex items-center gap-2">
                  {conversation.unread > 0 && (
                    <Badge className="bg-fixlyfy-error hover:bg-fixlyfy-error text-white text-xs px-2 py-1">
                      {conversation.unread}
                    </Badge>
                  )}
                  <span className="text-xs text-fixlyfy-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
              </div>
              
              {conversation.client.phone && (
                <div className="flex items-center gap-1 mb-2">
                  <Phone className="h-3 w-3 text-fixlyfy" />
                  <span className="text-xs text-fixlyfy-text-secondary">{conversation.client.phone}</span>
                </div>
              )}
              
              <p className="text-sm text-fixlyfy-text-secondary truncate leading-relaxed">
                {conversation.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
