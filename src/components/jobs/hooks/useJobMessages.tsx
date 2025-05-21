
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAI } from "@/hooks/use-ai";

interface UseJobMessagesProps {
  jobId: string;
}

interface Message {
  id: string;
  body: string;
  direction: string;
  sender?: string;
  recipient?: string;
  message_sid?: string;
  created_at: string;
}

export const useJobMessages = ({ jobId }: UseJobMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [client, setClient] = useState({ name: "", phone: "", id: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: "You are an assistant helping with job messaging for a field service company. Keep responses professional, friendly, and concise."
  });

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchMessages();
    }
  }, [jobId]);

  // Real-time subscription for incoming messages
  useEffect(() => {
    if (!jobId) return;

    // First, find the conversation ID for the current job
    const getConversationId = async () => {
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('job_id', jobId)
          .single();

        if (conversation) {
          // Set up real-time listener for this conversation
          const channel = supabase
            .channel('job-messages')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversation.id}`
              },
              (payload) => {
                // Make sure we don't duplicate messages
                const newMessage = payload.new;
                if (newMessage && !messages.some(msg => msg.id === newMessage.id)) {
                  fetchMessages(); // Refresh messages when a new one comes in
                }
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }
      } catch (error) {
        console.error("Error setting up real-time subscription:", error);
      }
    };

    getConversationId();
  }, [jobId, messages]);

  const fetchJobDetails = async () => {
    try {
      const { data: job } = await supabase
        .from('jobs')
        .select('*, clients:client_id(*)')
        .eq('id', jobId)
        .single();
      
      if (job && job.clients) {
        setClient({
          name: job.clients.name,
          phone: job.clients.phone || "",
          id: job.clients.id
        });
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load client information");
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // First find the conversation for this job
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('job_id', jobId)
        .single();
      
      if (conversation) {
        // Fetch messages for this conversation
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });
        
        if (data) {
          setMessages(data);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // If no conversation found, it's likely there are no messages yet
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestResponse = async () => {
    if (isAILoading) return;
    
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.direction === "outbound") {
        toast.info("Waiting for client response before suggesting a reply.");
        return;
      }
      
      const prompt = `Generate a professional response to this customer message: "${lastMessage.body}"`;
      const suggestedResponse = await generateText(prompt);
      
      if (suggestedResponse) {
        toast.success("AI suggestion ready", {
          description: suggestedResponse,
          action: {
            label: "Use",
            onClick: () => {
              handleUseSuggestion(suggestedResponse);
            }
          }
        });
      }
    } catch (error) {
      toast.error("Failed to generate response suggestion");
    }
  };
  
  const handleUseSuggestion = async (content: string) => {
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }
    
    setIsSendingMessage(true);
    
    try {
      // Call the Twilio edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: client.phone,
          body: content
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        // Find or create conversation
        let conversationId;
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('job_id', jobId);
        
        if (existingConversation && existingConversation.length > 0) {
          conversationId = existingConversation[0].id;
        } else {
          const { data: newConversation } = await supabase
            .from('conversations')
            .insert({
              job_id: jobId,
              client_id: client.id,
              status: 'active'
            })
            .select('id')
            .single();
          
          if (newConversation) {
            conversationId = newConversation.id;
          }
        }
        
        // Store the message in the database
        if (conversationId) {
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              body: content,
              direction: 'outbound',
              sender: 'You',
              recipient: client.phone,
              status: 'delivered',
              message_sid: data.sid
            });
          
          // Refresh messages
          fetchMessages();
        }
        
        toast.success("Message sent to client");
      } else {
        toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message to client");
    } finally {
      setIsSendingMessage(false);
    }
  };

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
