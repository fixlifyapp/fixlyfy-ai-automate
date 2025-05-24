
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedMessageList } from "@/components/messages/UnifiedMessageList";
import { MessageInputInline } from "@/components/messages/components/MessageInputInline";
import { useInlineMessaging } from "@/components/messages/hooks/useInlineMessaging";
import { useMessageAI } from "./hooks/messaging/useMessageAI";

interface JobMessagesProps {
  jobId: string;
}

interface UnifiedMessage {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  recipient?: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const [client, setClient] = useState({ name: "", phone: "", id: "", email: "" });
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { sendMessage, isSending } = useInlineMessaging({
    clientId: client.id,
    clientPhone: client.phone,
    jobId,
    onMessageSent: fetchMessages
  });

  // Fetch job client details and messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // Get job and client info
      const { data: job } = await supabase
        .from('jobs')
        .select(`
          *,
          clients:client_id(*)
        `)
        .eq('id', jobId)
        .single();

      if (job?.clients) {
        const clientData = {
          name: job.clients.name,
          phone: job.clients.phone || "",
          id: job.clients.id,
          email: job.clients.email || ""
        };
        setClient(clientData);

        // Get conversation for this job
        const { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('job_id', jobId)
          .single();

        if (conversation) {
          // Fetch messages
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

          setMessages(messagesData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchMessages();
    }
  }, [jobId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel('job-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const handleUseSuggestion = (content: string) => {
    // This will be handled by the MessageInputInline component
  };

  const { isAILoading, handleSuggestResponse } = useMessageAI({
    messages: messages.map(msg => ({
      id: msg.id,
      body: msg.body,
      direction: msg.direction,
      created_at: msg.created_at,
      sender: msg.sender
    })),
    client,
    jobId,
    onUseSuggestion: handleUseSuggestion
  });

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Messages</h3>
              {client.name && (
                <p className="text-sm text-muted-foreground">
                  Conversation with {client.name}
                  {client.phone && ` (${client.phone})`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestResponse}
                disabled={isAILoading || isLoading || messages.length === 0}
                className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {isAILoading ? (
                  <>
                    <Bot className="h-4 w-4 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <UnifiedMessageList 
          messages={messages}
          isLoading={isLoading}
          clientName={client.name}
          clientInfo={client}
        />
        
        {client.phone && (
          <MessageInputInline
            onSendMessage={sendMessage}
            isLoading={isSending}
            isDisabled={!client.phone}
            showSuggestResponse={true}
            onSuggestResponse={handleSuggestResponse}
            isAILoading={isAILoading}
            placeholder={`Message ${client.name}...`}
            clientInfo={client}
            messages={messages}
          />
        )}

        {!client.phone && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              No phone number available for this client
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
