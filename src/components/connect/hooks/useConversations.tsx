
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
  clientId?: string;
}

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
  messages: Message[];
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Fetch conversations from Supabase
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      
      try {
        // Get all conversations with client data
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select(`
            id, 
            status, 
            last_message_at, 
            clients:client_id(id, name, phone)
          `)
          .order('last_message_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (!conversationsData || conversationsData.length === 0) {
          setConversations([]);
          setIsLoading(false);
          return;
        }
        
        // Get the latest message for each conversation
        const formattedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            // Get the latest message
            const { data: latestMessage } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            // Format the conversation data
            return {
              id: conv.id,
              client: {
                id: conv.clients?.id || '',
                name: conv.clients?.name || 'Unknown Client',
                phone: conv.clients?.phone || ''
              },
              lastMessage: latestMessage?.body || 'No messages',
              lastMessageTime: latestMessage 
                ? new Date(latestMessage.created_at).toLocaleString() 
                : new Date(conv.last_message_at).toLocaleString(),
              unread: 0, // We'll implement this later
              messages: [] // We'll fetch messages when a conversation is selected
            };
          })
        );
        
        setConversations(formattedConversations);
        
        // Set the first conversation as active by default
        if (formattedConversations.length > 0 && !activeConversation) {
          setActiveConversation(formattedConversations[0].id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
    
    // Set up real-time listener for new conversations
    const channel = supabase
      .channel('connect-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Refresh the conversations list when any change happens
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  // Fetch messages for the active conversation
  useEffect(() => {
    if (!activeConversation) return;
    
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', activeConversation)
          .order('created_at', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Format messages and update the conversation
        if (messagesData) {
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            text: msg.body,
            sender: msg.direction === 'outbound' ? 'You' : msg.sender || 'Client',
            timestamp: new Date(msg.created_at).toLocaleString(),
            isClient: msg.direction === 'inbound'
          }));
          
          // Update the messages for the active conversation
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === activeConversation
                ? { ...conv, messages: formattedMessages, unread: 0 }
                : conv
            )
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    };
    
    fetchMessages();
    
    // Set up real-time listener for new messages
    const channel = supabase
      .channel('connect-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`
        },
        (payload) => {
          // Add the new message to the conversation
          const newMsg = payload.new;
          const formattedMsg = {
            id: newMsg.id,
            text: newMsg.body,
            sender: newMsg.direction === 'outbound' ? 'You' : newMsg.sender || 'Client',
            timestamp: new Date(newMsg.created_at).toLocaleString(),
            isClient: newMsg.direction === 'inbound'
          };
          
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === activeConversation
                ? { ...conv, messages: [...conv.messages, formattedMsg], lastMessage: newMsg.body, lastMessageTime: formattedMsg.timestamp }
                : conv
            )
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark conversation as read
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread: 0 }
          : conv
      )
    );
  };

  return {
    conversations,
    activeConversation,
    isLoading,
    selectedClient,
    setSelectedClient,
    handleConversationClick,
    setActiveConversation
  };
};
