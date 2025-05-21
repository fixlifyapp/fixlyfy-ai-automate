
import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ConversationsListProps {
  onSelectConversation: (conversation: any) => void;
  selectedConversation: any;
}

export const ConversationsList = ({ 
  onSelectConversation,
  selectedConversation 
}: ConversationsListProps) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchConversations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          client:client_id (
            id,
            name,
            phone
          ),
          messages:messages (
            body,
            created_at,
            direction,
            id
          )
        `)
        .order('last_message_at', { ascending: false });
        
      if (error) throw error;
      
      // Sort messages within each conversation
      const conversationsWithSortedMessages = data.map(conversation => {
        const sortedMessages = [...(conversation.messages || [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          ...conversation,
          messages: sortedMessages,
          lastMessage: sortedMessages[0] || null
        };
      });
      
      setConversations(conversationsWithSortedMessages);
      
      // Auto-select the first conversation if none is selected
      if (!selectedConversation && conversationsWithSortedMessages.length > 0) {
        onSelectConversation(conversationsWithSortedMessages[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 hover:bg-muted/50 cursor-pointer ${
              selectedConversation?.id === conversation.id ? "bg-muted" : ""
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <div className="bg-primary rounded-full flex items-center justify-center h-full text-primary-foreground">
                  {conversation.client?.name?.charAt(0) || "C"}
                </div>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate">
                    {conversation.client?.name || "Unknown Client"}
                  </h3>
                  {conversation.lastMessage?.created_at && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { 
                        addSuffix: true,
                        includeSeconds: true 
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm truncate text-muted-foreground">
                  {conversation.lastMessage?.body || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
