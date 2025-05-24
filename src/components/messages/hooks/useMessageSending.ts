
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormattedMessage } from "./types";

interface UseMessageSendingProps {
  client: {
    name: string;
    phone?: string;
    id?: string;
  };
  conversationId: string | null;
  setConversationId: (id: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<FormattedMessage[]>>;
}

export const useMessageSending = ({ 
  client, 
  conversationId, 
  setConversationId, 
  setMessages 
}: UseMessageSendingProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsLoading(true);

    try {
      // Add the new message to the local list immediately for better UX
      const tempMessage: FormattedMessage = {
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
    isLoading,
    handleSendMessage
  };
};
