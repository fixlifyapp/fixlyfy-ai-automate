
import { useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";

interface UseConversationMessagingProps {
  conversationId: string;
  clientPhone?: string;
}

export const useConversationMessaging = ({ 
  conversationId, 
  clientPhone 
}: UseConversationMessagingProps) => {
  const [messageText, setMessageText] = useState("");
  const { sendMessage, isSending } = useMessageContext();

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
    await sendMessage(messageText);
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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
