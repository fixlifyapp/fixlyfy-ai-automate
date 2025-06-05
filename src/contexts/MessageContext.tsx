
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageInput } from "@/components/messages/MessageInput";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";
import { useMessageDialog } from "@/components/messages/hooks/useMessageDialog";
import { useMessageAI } from "@/components/jobs/hooks/messaging/useMessageAI";

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Message {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  recipient?: string;
}

interface Conversation {
  id: string;
  client: Client;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  refreshConversations: () => Promise<void>;
  openMessageDialog: (client: Client, jobId?: string) => void;
  isLoading: boolean;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within MessageProvider");
  }
  return context;
};

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          last_message_at,
          created_at,
          clients:client_id (
            id,
            name,
            phone,
            email
          ),
          messages (
            id,
            body,
            direction,
            created_at,
            sender,
            recipient
          )
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      console.log('Raw conversations data:', conversationsData);

      const formattedConversations: Conversation[] = (conversationsData || []).map(conv => {
        const sortedMessages = (conv.messages || []).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const lastMessage = sortedMessages[sortedMessages.length - 1];
        
        return {
          id: conv.id,
          client: {
            id: conv.clients?.id || '',
            name: conv.clients?.name || 'Unknown Client',
            phone: conv.clients?.phone || '',
            email: conv.clients?.email || ''
          },
          messages: sortedMessages,
          lastMessage: lastMessage?.body || 'No messages',
          lastMessageTime: lastMessage?.created_at || conv.created_at,
          unreadCount: 0
        };
      });

      console.log('Formatted conversations:', formattedConversations);
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConversations = async () => {
    console.log('Refreshing conversations...');
    await fetchConversations();
  };

  const openMessageDialog = (client: Client, jobId?: string) => {
    console.log('Opening message dialog for client:', client);
    setSelectedClient(client);
    setDialogOpen(true);
  };

  // Set up real-time subscription for messages and conversations
  useEffect(() => {
    fetchConversations();

    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversation change detected, refreshing...');
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to message changes
    const messageChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('Message change detected, refreshing...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, []);

  const {
    message,
    setMessage,
    messages,
    isLoading: isDialogLoading,
    isLoadingMessages,
    handleSendMessage,
    conversationId
  } = useMessageDialog({ 
    client: selectedClient || { id: '', name: '', phone: '', email: '' }, 
    open: dialogOpen 
  });

  const handleUseSuggestion = (content: string) => {
    setMessage(content);
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: messages.map(msg => ({
      id: msg.id,
      body: msg.text,
      direction: msg.isClient ? 'inbound' as const : 'outbound' as const,
      created_at: msg.timestamp,
      sender: msg.sender
    })),
    client: selectedClient || { id: '', name: '', phone: '', email: '' },
    jobId: '',
    onUseSuggestion: handleUseSuggestion
  });

  const handleDialogSendMessage = async () => {
    await handleSendMessage();
    // Refresh conversations after sending message
    setTimeout(() => {
      refreshConversations();
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDialogSendMessage();
  };

  return (
    <MessageContext.Provider value={{
      conversations,
      refreshConversations,
      openMessageDialog,
      isLoading
    }}>
      {children}
      
      {/* Message Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Message {selectedClient?.name}
              {selectedClient?.phone && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedClient.phone})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto">
              <UnifiedMessageList 
                messages={messages}
                isLoading={isLoadingMessages}
                clientName={selectedClient?.name || ''}
              />
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-shrink-0">
              <MessageInput
                message={message}
                setMessage={setMessage}
                handleSendMessage={handleDialogSendMessage}
                isLoading={isDialogLoading}
                showSuggestResponse={true}
                onSuggestResponse={handleSuggestResponse}
                isAILoading={isAILoading}
                clientInfo={selectedClient || { id: '', name: '', phone: '', email: '' }}
                messages={messages}
              />
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </MessageContext.Provider>
  );
};
