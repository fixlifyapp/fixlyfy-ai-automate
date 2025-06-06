
import { createContext, useContext, useState, ReactNode } from "react";

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Message {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  recipient?: string;
}

interface Conversation {
  id: string;
  client: Client;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  refreshConversations: () => Promise<void>;
  openMessageDialog: (client: Client, jobId?: string) => void;
  isLoading: boolean;
  activeConversation: Conversation | null;
  sendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within MessageProvider");
  }
  return context;
};

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isSending, setIsSending] = useState(false);

  const refreshConversations = async () => {
    console.log('SMS functionality removed - conversations disabled');
    setConversations([]);
  };

  const openMessageDialog = (client: Client, jobId?: string) => {
    console.log('SMS functionality removed - message dialog disabled');
  };

  const sendMessage = async (message: string) => {
    console.log('SMS functionality removed - sending disabled');
  };

  return (
    <MessageContext.Provider value={{
      conversations,
      refreshConversations,
      openMessageDialog,
      isLoading,
      activeConversation,
      sendMessage,
      isSending
    }}>
      {children}
    </MessageContext.Provider>
  );
};
