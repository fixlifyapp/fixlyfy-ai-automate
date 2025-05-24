
import { useState, useEffect, useCallback } from "react";
import { 
  fetchJobClientDetails, 
  fetchConversationMessages, 
  sendClientMessage 
} from "./messaging/messagingUtils";
import { useMessageAI } from "./messaging/useMessageAI";
import { useRealTimeMessages } from "./messaging/useRealTimeMessages";
import { toast } from "sonner";

interface UseJobMessagesProps {
  jobId: string;
  message: string;
  setMessage: (message: string) => void;
}

export const useJobMessages = ({ jobId, message, setMessage }: UseJobMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    console.log("Fetching messages for job:", jobId);
    setIsLoading(true);
    try {
      const { messages: fetchedMessages, conversationId: fetchedConversationId, clientInfo } = await fetchConversationMessages(jobId);
      console.log("Fetched messages:", fetchedMessages);
      console.log("Client info:", clientInfo);
      
      setMessages(fetchedMessages);
      setConversationId(fetchedConversationId);
      
      // Update client info if available from conversation
      if (clientInfo) {
        setClient({
          name: clientInfo.name || "",
          phone: clientInfo.phone || "",
          id: clientInfo.id || "",
          email: clientInfo.email || ""
        });
      }
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  // Handle using AI suggestion
  const handleUseSuggestion = async (content: string) => {
    setMessage(content);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim() || !client.phone) {
      if (!client.phone) {
        toast.error("No phone number available for this client");
      }
      return;
    }
    
    console.log("Sending message:", message, "to client:", client);
    setIsSendingMessage(true);
    
    try {
      const result = await sendClientMessage({
        content: message,
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
        
        // Clear message and refresh
        setMessage("");
        fetchMessages();
        toast.success("Message sent successfully");
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Initialize AI features with enhanced context
  const { isAILoading, handleSuggestResponse } = useMessageAI({ 
    messages,
    client,
    jobId,
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
        console.log("Initializing data for job:", jobId);
        
        // Fetch client details from job
        const clientDetails = await fetchJobClientDetails(jobId);
        console.log("Job client details:", clientDetails);
        
        if (clientDetails) {
          setClient(clientDetails);
        }
        
        // Fetch messages
        await fetchMessages();
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
    handleUseSuggestion,
    handleSendMessage
  };
};
