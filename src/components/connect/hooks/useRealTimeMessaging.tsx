
import { useEffect } from "react";
import { useMessageContext } from "@/contexts/MessageContext";

interface UseRealTimeMessagingProps {
  onNewMessage?: () => void;
  enabled?: boolean;
}

export const useRealTimeMessaging = ({ 
  onNewMessage,
  enabled = true
}: UseRealTimeMessagingProps = {}) => {
  
  const { refreshConversations } = useMessageContext();
  
  // Use the centralized real-time system from MessageContext
  useEffect(() => {
    if (!enabled) return;

    // Call the refresh function from MessageContext which already has real-time setup
    if (onNewMessage) {
      // Since MessageContext already handles real-time updates,
      // we just need to call the callback when needed
      const handleUpdate = () => {
        refreshConversations();
        onNewMessage();
      };

      // Listen for custom events if needed
      window.addEventListener('messageContextUpdate', handleUpdate);
      
      return () => {
        window.removeEventListener('messageContextUpdate', handleUpdate);
      };
    }
  }, [onNewMessage, enabled, refreshConversations]);
};
