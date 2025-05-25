
import { useMessageContext } from "@/contexts/MessageContext";
import { useState } from "react";

export const useConversations = () => {
  const { 
    conversations, 
    refreshConversations, 
    isLoading,
    openMessageDialog 
  } = useMessageContext();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Transform the conversations to match the expected format for connect center
  const transformedConversations = conversations.map(conv => ({
    id: conv.id,
    client: conv.client,
    lastMessage: conv.lastMessage || '',
    lastMessageTime: conv.lastMessageTime || '',
    unread: 0, // Changed from unreadCount to unread to match ConversationsList interface
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

  const handleConversationClick = (conversationId: string) => {
    console.log('Conversation clicked:', conversationId);
    setActiveConversationId(conversationId);
    const conversation = transformedConversations.find(c => c.id === conversationId);
    if (conversation) {
      console.log('Opening dialog for client:', conversation.client);
      openMessageDialog(conversation.client);
    } else {
      console.error('Conversation not found:', conversationId);
    }
  };

  return {
    conversations: transformedConversations,
    refreshConversations,
    isLoading,
    activeConversation: activeConversationId,
    handleConversationClick
  };
};
