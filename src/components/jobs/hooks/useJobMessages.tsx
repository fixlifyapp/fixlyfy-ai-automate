
import { useState, useEffect, useCallback } from "react";
import { 
  fetchJobClientDetails, 
  fetchConversationMessages, 
  sendClientMessage 
} from "./messaging/messagingUtils";
import { useMessageAI } from "./messaging/useMessageAI";
import { useRealTimeMessages } from "./messaging/useRealTimeMessages";

interface UseJobMessagesProps {
  jobId: string;
}

export const useJobMessages = ({ jobId }: UseJobMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [client, setClient] = useState({ name: "", phone: "", id: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { messages: fetchedMessages, conversationId: fetchedConversationId } = await fetchConversationMessages(jobId);
      setMessages(fetchedMessages);
      setConversationId(fetchedConversationId);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  // Handle using AI suggestion
  const handleUseSuggestion = async (content: string) => {
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }
    
    setIsSendingMessage(true);
    
    try {
      const result = await sendClientMessage({
        content,
        clientPhone: client.phone,
        jobId,
        clientId: client.id,
        existingConversationId: conversationId
      });
      
      if (result.success) {
        // Update conversation ID if it's new
        if (result.conversationId && !conversationId) {
          setConversationId(result.conversationId);
        }
        
        // Refresh messages
        fetchMessages();
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Initialize AI features
  const { isAILoading, handleSuggestResponse } = useMessageAI({ 
    messages,
    onUseSuggestion: handleUseSuggestion
  });

  // Set up real-time subscription
  useRealTimeMessages({
    jobId,
    conversationId,
    onNewMessage: fetchMessages
  });

  // Initialize client details and messages
  useEffect(() => {
    if (jobId) {
      const initializeData = async () => {
        const clientDetails = await fetchJobClientDetails(jobId);
        if (clientDetails) {
          setClient(clientDetails);
        }
        fetchMessages();
      };
      
      initializeData();
    }
  }, [jobId, fetchMessages]);

  return {
    messages,
    client,
    isLoading,
    isSendingMessage,
    isAILoading,
    handleSuggestResponse,
    handleUseSuggestion
  };
};

// Import toast for error handling
import { toast } from "sonner";
