
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendMessageParams {
  content: string;
  clientPhone: string;
  jobId: string;
  clientId: string;
  existingConversationId?: string | null;
}

export const sendClientMessage = async ({
  content, 
  clientPhone,
  jobId,
  clientId,
  existingConversationId
}: SendMessageParams) => {
  try {
    // Call the Twilio edge function
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        to: clientPhone,
        body: content
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data.success) {
      // Find or create conversation
      let conversationId = existingConversationId;
      
      if (!conversationId) {
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
              client_id: clientId,
              status: 'active'
            })
            .select('id')
            .single();
          
          if (newConversation) {
            conversationId = newConversation.id;
          }
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
            recipient: clientPhone,
            status: 'delivered',
            message_sid: data.sid
          });
      }
      
      return { success: true, conversationId };
    } else {
      toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error: any) {
    console.error("Error sending message:", error);
    toast.error("Failed to send message to client");
    return { success: false, error: error.message };
  }
};

export const fetchJobClientDetails = async (jobId: string) => {
  try {
    const { data: job } = await supabase
      .from('jobs')
      .select('*, clients:client_id(*)')
      .eq('id', jobId)
      .single();
    
    if (job && job.clients) {
      return {
        name: job.clients.name,
        phone: job.clients.phone || "",
        id: job.clients.id
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching job details:", error);
    toast.error("Failed to load client information");
    return null;
  }
};

export const fetchConversationMessages = async (jobId: string) => {
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
        return { messages: data, conversationId: conversation.id };
      }
    }
    
    return { messages: [], conversationId: null };
  } catch (error) {
    console.error("Error fetching messages:", error);
    // If no conversation found, it's likely there are no messages yet
    return { messages: [], conversationId: null };
  }
};
