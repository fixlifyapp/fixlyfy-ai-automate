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
      
      // Send SMS via Telnyx edge function - let it handle conversation creation and message storage
      console.log("Invoking telnyx-sms function...");
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: client.phone,
          message: message,
          client_id: client.id,
          user_id: userId,
          conversation_id: conversationId // Pass existing conversation ID if available
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
      
      console.log("SMS sent successfully:", data.id);
      
      // Update conversation ID if returned from the function
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      toast.success("Message sent successfully");
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
