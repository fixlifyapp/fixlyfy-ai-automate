
import { useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";
import { sendClientMessage } from "@/components/jobs/hooks/messaging/messagingUtils";
import { toast } from "sonner";

interface UseConversationMessagingProps {
  conversationId: string;
  clientPhone?: string;
  clientId?: string;
}

interface ConversationMessagingReturn {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isSending: boolean;
}

export const useConversationMessaging = ({ 
  conversationId, 
  clientPhone,
  clientId 
}: UseConversationMessagingProps): ConversationMessagingReturn => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { refreshConversations } = useMessageContext();

  const handleSendMessage = async (): Promise<void> => {
    console.log("handleSendMessage called", { messageText, isSending, clientPhone, clientId });
    
    if (!messageText.trim() || isSending) {
      console.log("Message validation failed", { messageText: messageText.trim(), isSending });
      return;
    }

    if (!clientPhone) {
      console.log("No client phone available");
      toast.error("No phone number available for this client");
      return;
    }

    if (!clientId) {
      console.log("No client ID available");
      toast.error("Client information is missing");
      return;
    }

    setIsSending(true);
    console.log("Starting message send process...");

    try {
      const result = await sendClientMessage({
        content: messageText.trim(),
        clientPhone,
        jobId: "", // No job context in connect center
        clientId,
        existingConversationId: conversationId || null
      });

      console.log("sendClientMessage result:", result);

      if (result.success) {
        setMessageText("");
        toast.success("Message sent successfully");
        
        // Refresh conversations to show the new message
        console.log("Refreshing conversations...");
        refreshConversations();
      } else {
        console.error("Message sending failed:", result.error);
        toast.error(`Failed to send message: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
      console.log("Message send process completed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("Enter key pressed, sending message...");
      handleSendMessage();
    }
  };

  return {
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyDown,
    isSending
  };
};
