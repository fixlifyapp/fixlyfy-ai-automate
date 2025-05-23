
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealTimeMessagingProps {
  onNewMessage?: () => void;
  enabled?: boolean;
}

export const useRealTimeMessaging = ({ 
  onNewMessage,
  enabled = true
}: UseRealTimeMessagingProps = {}) => {
  
  // Set up real-time subscription for incoming messages
  useEffect(() => {
    if (!enabled) return;

    // Create a channel listening for changes on the messages table
    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        },
        (payload) => {
          console.log('New message received:', payload);
          if (onNewMessage) {
            onNewMessage();
          }
        }
      )
      .subscribe();

    // Also listen for conversation updates
    const conversationsChannel = supabase
      .channel('public:conversations')
      .on(
        'postgres_changes',
        { 
          event: '*', // Listen for all events
          schema: 'public', 
          table: 'conversations' 
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          if (onNewMessage) {
            onNewMessage();
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [onNewMessage, enabled]);
};
