
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

      if (error) throw error;

      const formattedConversations: Conversation[] = conversationsData?.map(conv => ({
        id: conv.id,
        client: {
          id: conv.clients?.id || '',
          name: conv.clients?.name || 'Unknown',
          phone: conv.clients?.phone || '',
          email: conv.clients?.email || ''
        },
        messages: conv.messages?.map(msg => ({
          id: msg.id,
          body: msg.body,
          direction: msg.direction as 'inbound' | 'outbound',
          created_at: msg.created_at,
          sender: msg.sender,
          recipient: msg.recipient
        })) || [],
        lastMessage: conv.messages?.[conv.messages.length - 1]?.body || '',
        lastMessageTime: conv.last_message_at || ''
      })) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  const openMessageDialog = async (client: Client, jobId?: string) => {
    try {
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
      } else {
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

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // Set active conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      } else {
        // Create a basic conversation object if not found
        setActiveConversation({
          id: conversationId,
          client: client,
          messages: [],
          lastMessage: '',
          lastMessageTime: ''
        });
      }

      toast.success(`Message dialog opened for ${client.name}`);
      
    } catch (error) {
      console.error('Error opening message dialog:', error);
      toast.error('Failed to open message dialog');
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeConversation || !message.trim()) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: activeConversation.client.phone,
          body: message,
          client_id: activeConversation.client.id
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send message');
      }

      toast.success('Message sent successfully');
      
      // Refresh conversations to show the new message
      await refreshConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
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
