
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  activeConversation: Conversation | null;
  sendMessage: (message: string) => Promise<void>;
  isSending: boolean;
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
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fetchConversations = async () => {
    try {
      console.log('🔄 Fetching conversations from database...');
      
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
            recipient,
            status
          )
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching conversations:', error);
        return;
      }

      console.log('📨 Raw conversations data from DB:', conversationsData?.length || 0, 'conversations');

      const formattedConversations: Conversation[] = (conversationsData || []).map(conv => {
        const sortedMessages = (conv.messages || []).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const lastMessage = sortedMessages[sortedMessages.length - 1];
        
        console.log(`📨 Processing conversation ${conv.id}: ${sortedMessages.length} messages, client: ${conv.clients?.name}`);
        
        return {
          id: conv.id,
          client: {
            id: conv.clients?.id || '',
            name: conv.clients?.name || 'Unknown Client',
            phone: conv.clients?.phone || '',
            email: conv.clients?.email || ''
          },
          messages: sortedMessages.map(msg => ({
            ...msg,
            direction: msg.direction as 'inbound' | 'outbound'
          })),
          lastMessage: lastMessage?.body || 'No messages',
          lastMessageTime: lastMessage?.created_at || conv.created_at,
          unreadCount: 0
        };
      });

      console.log('✅ Formatted conversations:', formattedConversations.length, 'total');
      setConversations(formattedConversations);
    } catch (error) {
      console.error('💥 Error in fetchConversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConversations = async () => {
    console.log('🔄 Refreshing conversations...');
    await fetchConversations();
  };

  const openMessageDialog = (client: Client, jobId?: string) => {
    console.log('💬 Setting active conversation for client:', client);
    
    const conversation = conversations.find(conv => conv.client.id === client.id);
    setActiveConversation(conversation || {
      id: `temp-${client.id}`,
      client,
      messages: [],
      lastMessage: 'No messages yet',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    });
  };

  const sendMessage = async (message: string) => {
    if (!activeConversation || !message.trim()) return;
    
    setIsSending(true);
    try {
      console.log('📤 Sending message:', message, 'to client:', activeConversation.client.name);
      
      setTimeout(() => {
        refreshConversations();
      }, 1000);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Set up real-time subscription for messages and conversations
  useEffect(() => {
    console.log('🔄 Initial fetch of conversations...');
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
        (payload) => {
          console.log('🔔 Conversation change detected:', payload);
          setTimeout(() => fetchConversations(), 500);
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
        (payload) => {
          console.log('🔔 Message change detected:', payload);
          setTimeout(() => fetchConversations(), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, []);

  return (
    <MessageContext.Provider value={{
      conversations,
      refreshConversations,
      openMessageDialog,
      isLoading,
      activeConversation,
      sendMessage,
      isSending
    }}>
      {children}
    </MessageContext.Provider>
  );
};
