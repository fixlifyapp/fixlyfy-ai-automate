
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
}

interface MessageContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isMessageDialogOpen: boolean;
  isLoading: boolean;
  isSending: boolean;
  openMessageDialog: (client: { id?: string; name: string; phone?: string; email?: string }, jobId?: string) => void;
  closeMessageDialog: () => void;
  sendMessage: (content: string) => Promise<void>;
  refreshConversations: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Real-time subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => refreshConversations()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => refreshConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshConversations = async () => {
    try {
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          last_message_at,
          clients:client_id(id, name, phone, email)
        `)
        .order('last_message_at', { ascending: false });

      if (conversationsData) {
        const formattedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: true });

            const lastMessage = messages?.[messages.length - 1];

            // Format messages to ensure correct types
            const formattedMessages: Message[] = (messages || []).map(msg => ({
              id: msg.id,
              body: msg.body || '',
              direction: (msg.direction === 'inbound' || msg.direction === 'outbound') ? msg.direction : 'outbound',
              created_at: msg.created_at || new Date().toISOString(),
              sender: msg.sender || undefined,
              recipient: msg.recipient || undefined
            }));

            return {
              id: conv.id,
              client: {
                id: conv.clients?.id || '',
                name: conv.clients?.name || 'Unknown Client',
                phone: conv.clients?.phone || '',
                email: conv.clients?.email || ''
              },
              messages: formattedMessages,
              lastMessage: lastMessage?.body || '',
              lastMessageTime: lastMessage?.created_at || conv.last_message_at
            };
          })
        );

        setConversations(formattedConversations);

        // Update active conversation if it exists
        if (activeConversation) {
          const updatedActive = formattedConversations.find(c => c.id === activeConversation.id);
          if (updatedActive) {
            setActiveConversation(updatedActive);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  const findOrCreateConversation = async (clientId: string) => {
    try {
      // First, try to find existing conversation for this client
      const { data: existingConv } = await supabase
        .from('conversations')
        .select(`
          id,
          clients:client_id(id, name, phone, email)
        `)
        .eq('client_id', clientId)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation only if none exists
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      return newConversation.id;
    } catch (error) {
      console.error('Error in findOrCreateConversation:', error);
      return null;
    }
  };

  const openMessageDialog = async (client: { id?: string; name: string; phone?: string; email?: string }, jobId?: string) => {
    setIsLoading(true);
    
    try {
      // Find existing conversation for this client
      let conversation = conversations.find(c => c.client.id === client.id);
      
      if (!conversation && client.id) {
        // Try to find conversation in database
        const { data: existingConv } = await supabase
          .from('conversations')
          .select(`
            id,
            clients:client_id(id, name, phone, email)
          `)
          .eq('client_id', client.id)
          .single();

        if (existingConv) {
          // Fetch messages for this conversation
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existingConv.id)
            .order('created_at', { ascending: true });

          // Format messages to ensure correct types
          const formattedMessages: Message[] = (messages || []).map(msg => ({
            id: msg.id,
            body: msg.body || '',
            direction: (msg.direction === 'inbound' || msg.direction === 'outbound') ? msg.direction : 'outbound',
            created_at: msg.created_at || new Date().toISOString(),
            sender: msg.sender || undefined,
            recipient: msg.recipient || undefined
          }));

          conversation = {
            id: existingConv.id,
            client: {
              id: existingConv.clients?.id || client.id,
              name: existingConv.clients?.name || client.name,
              phone: existingConv.clients?.phone || client.phone || '',
              email: existingConv.clients?.email || client.email || ''
            },
            messages: formattedMessages
          };
        }
      }

      if (!conversation) {
        // Create new conversation placeholder - don't create in DB yet
        conversation = {
          id: '',
          client: {
            id: client.id || '',
            name: client.name,
            phone: client.phone || '',
            email: client.email || ''
          },
          messages: []
        };
      }

      setActiveConversation(conversation);
      setIsMessageDialogOpen(true);
    } catch (error) {
      console.error('Error opening message dialog:', error);
      toast.error('Failed to open message dialog');
    } finally {
      setIsLoading(false);
    }
  };

  const closeMessageDialog = () => {
    setIsMessageDialogOpen(false);
    setActiveConversation(null);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeConversation || isSending) return;
    
    const client = activeConversation.client;
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsSending(true);

    try {
      // Send SMS via Twilio
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: client.phone,
          body: content
        }
      });

      if (error) throw error;

      if (!data.success) {
        toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
        return;
      }

      // Find or create conversation - always check for existing first
      let conversationId = activeConversation.id;
      
      if (!conversationId && client.id) {
        conversationId = await findOrCreateConversation(client.id);
      }

      // Store message in database
      if (conversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            body: content,
            direction: 'outbound',
            sender: 'You',
            recipient: client.phone,
            status: 'delivered',
            message_sid: data.sid
          });

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

        toast.success("Message sent successfully");
        refreshConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    refreshConversations();
  }, []);

  return (
    <MessageContext.Provider value={{
      conversations,
      activeConversation,
      isMessageDialogOpen,
      isLoading,
      isSending,
      openMessageDialog,
      closeMessageDialog,
      sendMessage,
      refreshConversations
    }}>
      {children}
    </MessageContext.Provider>
  );
};
