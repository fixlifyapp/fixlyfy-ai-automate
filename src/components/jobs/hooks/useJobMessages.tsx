import { useMessageContext } from "@/contexts/MessageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseJobMessagesProps {
  jobId: string;
  message: string;
  setMessage: (message: string) => void;
}

export const useJobMessages = ({ jobId, message, setMessage }: UseJobMessagesProps) => {
  const { conversations, openMessageDialog } = useMessageContext();
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch client details from job
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!jobId) return;
      
      setIsLoading(true);
      try {
        const { data: job } = await supabase
          .from('jobs')
          .select(`
            *,
            clients:client_id(*)
          `)
          .eq('id', jobId)
          .single();

        if (job?.clients) {
          setClient({
            name: job.clients.name,
            phone: job.clients.phone || "",
            id: job.clients.id,
            email: job.clients.email || ""
          });
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientDetails();
  }, [jobId]);

  // Find messages for this client from centralized conversations
  const clientConversation = conversations.find(conv => conv.client.id === client.id);
  const messages = clientConversation?.messages || [];

  const handleOpenMessageDialog = () => {
    if (client.id) {
      openMessageDialog(client, jobId);
    }
  };

  return {
    messages,
    client,
    isLoading,
    isSendingMessage: false, // Handled by MessageContext
    isAILoading: false, // This would be handled by AI hooks
    handleSuggestResponse: () => {}, // Placeholder
    handleUseSuggestion: (content: string) => setMessage(content),
    handleSendMessage: handleOpenMessageDialog // Open dialog instead of direct send
  };
};
