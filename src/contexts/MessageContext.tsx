import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Use refs to prevent duplicate subscriptions and excessive refreshes
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const lastRefreshRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Much more aggressive debouncing to prevent excessive API calls
  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;
    
    // Prevent refreshes more frequent than every 2 seconds
    if (timeSinceLastRefresh < 2000) {
      console.log('Skipping refresh - too frequent');
      return;
    }
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        lastRefreshRef.current = Date.now();
        refreshConversations();
      }
    }, 1000); // 1 second delay
  }, []);

  // Single real-time subscription with better cleanup
  useEffect(() => {
    if (isSubscribedRef.current) return;
    
    console.log('Setting up real-time messaging subscription...');
    
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    const messagesChannel = supabase
      .channel('unified-messages-v4') // Changed version to force new subscription
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Message change detected:', payload.eventType);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          console.log('Conversation change detected:', payload.eventType);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = messagesChannel;

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      isSubscribedRef.current = false;
    };
  }, []); // Remove debouncedRefresh from dependencies

  const refreshConversations = useCallback(async () => {
    // Don't refresh if already loading or if component is unmounted
    if (isLoading || !isMountedRef.current) {
      return;
    }

    try {
      console.log('Refreshing conversations...');
      setIsLoading(true);
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          last_message_at,
          clients:client_id(id, name, phone, email)
        `)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      if (conversationsData && isMountedRef.current) {
        const formattedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            const { data: messages, error: messagesError } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: true });

            if (messagesError) {
              console.error('Error fetching messages for conversation:', conv.id, messagesError);
              return null;
            }

            const lastMessage = messages?.[messages.length - 1];

            const formattedMessages: Message[] = (messages || []).map(msg => ({
              id: msg.id || '',
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

        const validConversations = formattedConversations.filter(conv => conv !== null) as Conversation[];
        
        if (isMountedRef.current) {
          setConversations(validConversations);

          // Update active conversation if it exists
          if (activeConversation) {
            const updatedActive = validConversations.find(c => c.id === activeConversation.id);
            if (updatedActive) {
              setActiveConversation(updatedActive);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      if (isMountedRef.current) {
        toast.error('Failed to refresh conversations');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [activeConversation]);

  const findOrCreateConversation = useCallback(async (clientId: string) => {
    try {
      const { data: existingConv, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', clientId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding conversation:', findError);
        return null;
      }

      if (existingConv) {
        return existingConv.id;
      }

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
  }, []);

  const openMessageDialog = useCallback(async (client: { id?: string; name: string; phone?: string; email?: string }, jobId?: string) => {
    console.log('Opening message dialog for client:', client);
    setIsLoading(true);
    
    try {
      let conversation = conversations.find(c => c.client.id === client.id);
      
      if (!conversation && client.id) {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select(`
            id,
            clients:client_id(id, name, phone, email)
          `)
          .eq('client_id', client.id)
          .single();

        if (existingConv) {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existingConv.id)
            .order('created_at', { ascending: true });

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
  }, [conversations]);

  const closeMessageDialog = useCallback(() => {
    setIsMessageDialogOpen(false);
    setActiveConversation(null);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !activeConversation || isSending) return;
    
    const client = activeConversation.client;
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsSending(true);

    try {
      console.log('Sending message via Twilio:', { content, phone: client.phone });
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: client.phone,
          body: content
        }
      });

      if (error) {
        console.error('Twilio function error:', error);
        throw new Error(`Twilio function failed: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('Twilio SMS failed:', data);
        throw new Error(`Failed to send SMS: ${data?.error || 'Unknown error'}`);
      }

      console.log('SMS sent successfully:', data.sid);

      let conversationId = activeConversation.id;
      
      if (!conversationId && client.id) {
        conversationId = await findOrCreateConversation(client.id);
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
      }

      if (conversationId) {
        const { error: messageError } = await supabase
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

        if (messageError) {
          console.error('Error saving message:', messageError);
          throw new Error('Failed to save message to database');
        }

        const { error: updateError } = await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

        if (updateError) {
          console.error('Error updating conversation timestamp:', updateError);
        }

        toast.success("Message sent successfully");
        
        // Trigger a refresh after a short delay
        setTimeout(() => {
          if (isMountedRef.current) {
            debouncedRefresh();
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  }, [activeConversation, isSending, findOrCreateConversation, debouncedRefresh]);

  // Load conversations on mount with a single call
  useEffect(() => {
    refreshConversations();
  }, []); // Only run once on mount

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
      refreshConversations: debouncedRefresh
    }}>
      {children}
    </MessageContext.Provider>
  );
};
