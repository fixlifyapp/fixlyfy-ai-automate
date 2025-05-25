
import { useMessageContext } from "@/contexts/MessageContext";

export const useConversations = () => {
  const { 
    conversations, 
    refreshConversations, 
    isLoading 
  } = useMessageContext();

  // Transform the conversations to match the expected format for connect center
  const transformedConversations = conversations.map(conv => ({
    id: conv.id,
    client: conv.client,
    lastMessage: conv.lastMessage || '',
    lastMessageTime: conv.lastMessageTime || '',
    unreadCount: 0, // Could be calculated based on read status
    messages: conv.messages.map(msg => ({
      id: msg.id,
      text: msg.body,
      sender: msg.direction === 'outbound' ? 'You' : conv.client.name,
      timestamp: new Date(msg.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      isClient: msg.direction === 'inbound'
    }))
  }));

  return {
    conversations: transformedConversations,
    refreshConversations,
    isLoading
  };
};
