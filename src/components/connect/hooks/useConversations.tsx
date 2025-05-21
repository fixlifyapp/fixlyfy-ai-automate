
import { useState, useEffect } from "react";
import { clients } from "@/data/clients";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
  clientId?: string;
}

interface Conversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Initialize sample conversations - in a real app, fetch from the database
  useEffect(() => {
    const sampleConversations: Conversation[] = clients.slice(0, 5).map((client, index) => ({
      id: `conv-${index}`,
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
      },
      lastMessage: index === 0 
        ? "Yes, I'll be home for the appointment tomorrow." 
        : "Thank you for scheduling the service.",
      lastMessageTime: new Date(Date.now() - index * 3600000).toLocaleString(),
      unread: index === 0 ? 2 : 0,
      messages: [
        {
          id: `msg-${index}-1`,
          text: "Hello! Just confirming our appointment tomorrow at 1:30 PM.",
          sender: "You",
          timestamp: new Date(Date.now() - (index + 1) * 7200000).toLocaleString(),
          isClient: false
        },
        {
          id: `msg-${index}-2`,
          text: index === 0 
            ? "Yes, I'll be home for the appointment tomorrow." 
            : "Thank you for scheduling the service.",
          sender: client.name,
          timestamp: new Date(Date.now() - index * 3600000).toLocaleString(),
          isClient: true,
          clientId: client.id
        }
      ]
    }));
    
    setConversations(sampleConversations);
    setIsLoading(false);
    
    // Set the first conversation as active by default
    if (sampleConversations.length > 0) {
      setActiveConversation(sampleConversations[0].id);
    }
  }, []);

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark conversation as read
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread: 0 }
          : conv
      )
    );
  };

  return {
    conversations,
    activeConversation,
    isLoading,
    selectedClient,
    setSelectedClient,
    handleConversationClick,
    setActiveConversation
  };
};
