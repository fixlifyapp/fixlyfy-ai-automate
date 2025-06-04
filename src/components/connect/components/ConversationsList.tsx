
import { Loader2, MessageSquare } from "lucide-react";
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
        <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-fixlyfy-text-secondary p-4">
        <MessageSquare className="h-12 w-12 mb-2" />
        <p className="text-center">No conversations found</p>
        <p className="text-sm text-center mt-2">Try searching for a different client or creating a new message</p>
      </div>
    );
  }

  return (
    <>
      {conversations.map((conversation) => (
        <div 
          key={conversation.id}
          onClick={() => onConversationClick(conversation)}
          className={cn(
            "p-4 border-b border-fixlyfy-border cursor-pointer hover:bg-fixlyfy-bg-hover",
            activeConversation === conversation.id && "bg-fixlyfy-bg-hover"
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{conversation.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">{conversation.client.name}</h3>
                <span className="text-xs text-fixlyfy-text-secondary">
                  {conversation.lastMessageTime.split(",")[0]}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-fixlyfy-text-secondary truncate">
                  {conversation.lastMessage}
                </p>
                {conversation.unread > 0 && (
                  <Badge className="bg-fixlyfy">{conversation.unread}</Badge>
                )}
              </div>
              {conversation.client.phone && (
                <p className="text-xs text-fixlyfy-text-secondary">{conversation.client.phone}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
