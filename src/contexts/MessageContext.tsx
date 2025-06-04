
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
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
}

interface MessageContextType {
  openMessageDialog: (client: Client, jobId?: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  refreshConversations: () => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const refreshConversations = async () => {
    setIsLoading(true);
    try {
      console.log('MessageContext: Refreshing conversations...');
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          clients:client_id(id, name, phone, email),
          messages(id, body, direction, created_at, sender, recipient)
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('MessageContext: Error fetching conversations:', error);
        throw error;
      }

      console.log('MessageContext: Raw conversations data:', conversationsData);

      const formattedConversations: Conversation[] = conversationsData?.map(conv => {
        const sortedMessages = conv.messages?.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ) || [];
        
        return {
          id: conv.id,
          client: {
            id: conv.clients?.id || '',
            name: conv.clients?.name || 'Unknown',
            phone: conv.clients?.phone || '',
            email: conv.clients?.email || ''
          },
          messages: sortedMessages.map(msg => ({
            id: msg.id,
            body: msg.body,
            direction: msg.direction as 'inbound' | 'outbound',
            created_at: msg.created_at,
            sender: msg.sender,
            recipient: msg.recipient
          })),
          lastMessage: sortedMessages[sortedMessages.length - 1]?.body || '',
          lastMessageTime: conv.last_message_at || ''
        };
      }) || [];

      console.log('MessageContext: Formatted conversations:', formattedConversations);
      setConversations(formattedConversations);
    } catch (error) {
      console.error('MessageContext: Error refreshing conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('MessageContext: Setting up real-time subscriptions');
    
    // Subscribe to conversations changes
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('MessageContext: Conversation change detected:', payload);
          refreshConversations();
        }
      )
      .subscribe();

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('MessageContext: Message change detected:', payload);
          refreshConversations();
        }
      )
      .subscribe();

    // Initial load
    refreshConversations();

    return () => {
      console.log('MessageContext: Cleaning up subscriptions');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const openMessageDialog = async (client: Client, jobId?: string) => {
    try {
      console.log('MessageContext: Opening message dialog for client:', client);
      
      // Find existing conversation or create new one
      let conversationId;
      
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', client.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (existingConversation) {
        conversationId = existingConversation.id;
        console.log('MessageContext: Found existing conversation:', conversationId);
      } else {
        console.log('MessageContext: Creating new conversation for client:', client.id);
        
        const conversationData: any = {
          client_id: client.id,
          status: 'active',
          last_message_at: new Date().toISOString()
        };

        if (jobId) {
          conversationData.job_id = jobId;
        }

        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert(conversationData)
          .select('id')
          .single();

        if (convError) {
          console.error('MessageContext: Error creating conversation:', convError);
          throw convError;
        }
        
        conversationId = newConversation.id;
        console.log('MessageContext: Created new conversation:', conversationId);
      }

      // Set active conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
        console.log('MessageContext: Set active conversation from existing list');
      } else {
        // Create a basic conversation object if not found in current list
        setActiveConversation({
          id: conversationId,
          client: client,
          messages: [],
          lastMessage: '',
          lastMessageTime: ''
        });
        console.log('MessageContext: Created temporary active conversation object');
        
        // Refresh to get the latest data
        await refreshConversations();
      }

      toast.success(`Message dialog opened for ${client.name}`);
      
    } catch (error) {
      console.error('MessageContext: Error opening message dialog:', error);
      toast.error('Failed to open message dialog');
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeConversation || !message.trim()) return;

    setIsSending(true);
    try {
      console.log('MessageContext: Sending message to:', activeConversation.client.phone);
      
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: activeConversation.client.phone,
          body: message,
          client_id: activeConversation.client.id,
          job_id: 'message-context' // You might want to pass actual job_id if available
        }
      });

      if (error) {
        console.error('MessageContext: Supabase function error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('MessageContext: SMS sending failed:', data);
        throw new Error(data?.error || 'Failed to send message');
      }

      console.log('MessageContext: Message sent successfully');
      toast.success('Message sent successfully');
      
      // Refresh conversations to show the new message
      await refreshConversations();
      
    } catch (error) {
      console.error('MessageContext: Error sending message:', error);
      toast.error('Failed to send message: ' + error.message);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MessageContext.Provider value={{ 
      openMessageDialog, 
      sendMessage, 
      conversations,
      activeConversation,
      refreshConversations,
      isLoading,
      isSending
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
