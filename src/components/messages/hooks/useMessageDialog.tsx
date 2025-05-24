
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseMessageDialogProps {
  client: {
    name: string;
    phone?: string;
    id?: string;
  };
  open: boolean;
}

export const useMessageDialog = ({ client, open }: UseMessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!open || !client.id) return;
    
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined
        },
        (payload) => {
          // Only process messages that aren't already in our list
          const newMsg = payload.new;
          if (newMsg && !messages.some(msg => msg.id === newMsg.id)) {
            const formattedMessage = {
              id: newMsg.id,
              text: newMsg.body,
              sender: newMsg.direction === 'outbound' ? 'You' : client.name,
              timestamp: new Date(newMsg.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }),
              isClient: newMsg.direction === 'inbound'
            };
            
            setMessages(prev => [...prev, formattedMessage]);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, client.id, conversationId, messages]);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (open && client.id) {
      fetchMessages();
    }
  }, [open, client.id]);

  const fetchMessages = async () => {
    if (!client.id) return;
    
    setIsLoadingMessages(true);
    
    try {
      // First, check if a conversation exists for this client
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', client.id);
      
      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        setConversationId(conversation.id);
        
        // Fetch messages for this conversation
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });
          
        if (messagesData) {
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            text: msg.body,
            sender: msg.direction === 'outbound' ? 'You' : client.name,
            timestamp: new Date(msg.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }),
            isClient: msg.direction === 'inbound'
          }));
          
          setMessages(formattedMessages);
        }
      } else {
        // No conversation exists yet
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsLoading(true);

    try {
      // Add the new message to the local list immediately for better UX
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: message,
        sender: "You",
        timestamp: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
        isClient: false
      };

      setMessages(prev => [...prev, tempMessage]);
      
      let currentConversationId = conversationId;
      
      // If no conversation exists, create one
      if (!currentConversationId && client.id) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: client.id,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (convError) {
          throw convError;
        }
        
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      }
      
      // Send SMS via Twilio edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: client.phone,
          body: message
        }
      });
      
      if (error) {
        console.error("Error sending SMS:", error);
        toast.error("Failed to send SMS. Please try again.");
        return;
      }
      
      if (!data.success) {
        toast.error(`Failed to send SMS: ${data.error || 'Unknown error'}`);
        return;
      }
      
      // Store the message in the database
      if (currentConversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            body: message,
            direction: 'outbound',
            sender: 'You',
            recipient: client.phone,
            status: 'delivered',
            message_sid: data.sid
          });
          
        // Clear input after successful send
        setMessage("");
        toast.success("Message sent successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    message,
    setMessage,
    messages,
    isLoading,
    isLoadingMessages,
    handleSendMessage,
    conversationId
  };
};
