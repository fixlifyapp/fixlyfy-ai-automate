
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
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">No conversations found</h3>
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
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div 
          key={conversation.id}
          onClick={() => onConversationClick(conversation)}
          className={cn(
            "p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50",
            activeConversation === conversation.id && "bg-blue-100 border-r-4 border-fixlyfy"
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {conversation.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {conversation.client.name}
                </h3>
                <div className="flex items-center gap-2">
                  {conversation.unread > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
                      {conversation.unread}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
              </div>
              
              {conversation.client.phone && (
                <div className="flex items-center gap-1 mb-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{conversation.client.phone}</span>
                </div>
              )}
              
              <p className="text-sm text-gray-600 truncate leading-relaxed">
                {conversation.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
