
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, PlusCircle, Bot, Loader2 } from "lucide-react";
import { MessageDialog } from "@/components/messages/MessageDialog";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JobMessagesProps {
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

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: "You are an assistant helping with job messaging for a field service company. Keep responses professional, friendly, and concise."
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [client, setClient] = useState({ name: "", phone: "", id: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Messages</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleSuggestResponse}
              disabled={isAILoading || isSendingMessage || messages.length === 0}
              className="gap-2"
            >
              {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              {isAILoading ? "Thinking..." : "Suggest Response"}
            </Button>
            <Button 
              onClick={() => setIsMessageDialogOpen(true)} 
              className="gap-2"
              disabled={isSendingMessage}
            >
              <PlusCircle size={16} />
              New Message
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.direction === 'outbound' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.direction === 'outbound' 
                      ? 'bg-muted text-foreground' 
                      : 'bg-fixlyfy text-white'
                  }`}
                >
                  <p className="text-sm">{message.body}</p>
                  <span className="text-xs text-fixlyfy-text-secondary block mt-1">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p>No messages yet. Send your first message.</p>
          </div>
        )}
        
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          client={client}
        />
      </CardContent>
    </Card>
  );
};
