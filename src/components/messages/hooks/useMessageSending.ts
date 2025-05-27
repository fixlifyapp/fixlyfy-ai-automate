
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
      console.log("Sending message:", { message, clientPhone: client.phone });
      
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
        console.log("Creating new conversation for client:", client.id);
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
          console.error("Error creating conversation:", convError);
          throw convError;
        }
        
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
        console.log("Created conversation:", currentConversationId);
      }
      
      // Send SMS via Amazon SNS edge function
      console.log("Invoking amazon-sns-sms function...");
      const { data, error } = await supabase.functions.invoke('amazon-sns-sms', {
        body: {
          to: client.phone,
          body: message,
          client_id: client.id
        }
      });
      
      if (error) {
        console.error("Error sending SMS:", error);
        toast.error("Failed to send SMS. Please try again.");
        // Remove the temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        return;
      }
      
      if (!data.success) {
        console.error("SMS sending failed:", data);
        toast.error(`Failed to send SMS: ${data.error || 'Unknown error'}`);
        // Remove the temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        return;
      }
      
      console.log("SMS sent successfully:", data.message_id);
      
      // Store the message in the database
      if (currentConversationId) {
        console.log("Storing message in database...");
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: currentConversationId,
            body: message,
            direction: 'outbound',
            sender: 'You',
            recipient: client.phone,
            status: 'delivered',
            message_sid: data.message_id
          });
          
        if (msgError) {
          console.error("Error storing message:", msgError);
        } else {
          console.log("Message stored successfully");
        }
          
        toast.success("Message sent successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
