
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendMessageParams {
  content: string;
  clientPhone: string;
  jobId: string;
  clientId: string;
  existingConversationId?: string | null;
}

const findOrCreateConversation = async (clientId: string, jobId?: string) => {
  try {
    // First, try to find existing conversation for this client
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .single();

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation only if none exists
    const conversationData: any = {
      client_id: clientId,
      status: 'active',
      last_message_at: new Date().toISOString()
    };

    // Add job_id if provided
    if (jobId) {
      conversationData.job_id = jobId;
    }

    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return newConversation.id;
  } catch (error) {
    console.error('Error in findOrCreateConversation:', error);
    return null;
  }
};

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
      // Find or create conversation - always check for existing first
      let conversationId = existingConversationId;
      
      if (!conversationId) {
        conversationId = await findOrCreateConversation(clientId, jobId);
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
          
        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
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
      .select(`
        *,
        clients:client_id(*)
      `)
      .eq('id', jobId)
      .single();
    
    if (job && job.clients) {
      return {
        name: job.clients.name,
        phone: job.clients.phone || "",
        id: job.clients.id,
        email: job.clients.email || ""
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
    // First find the conversation for this job's client
    const { data: job } = await supabase
      .from('jobs')
      .select('client_id')
      .eq('id', jobId)
      .single();

    if (!job?.client_id) {
      return { messages: [], conversationId: null, clientInfo: null };
    }

    // Find conversation for this client (unique constraint ensures only one)
    const { data: conversation } = await supabase
      .from('conversations')
      .select(`
        *,
        clients:client_id(id, name, phone, email)
      `)
      .eq('client_id', job.client_id)
      .single();
    
    if (conversation) {
      // Fetch messages for this conversation with proper ordering
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      
      if (messagesData) {
        return { 
          messages: messagesData, 
          conversationId: conversation.id,
          clientInfo: conversation.clients
        };
      }
    }
    
    return { messages: [], conversationId: null, clientInfo: null };
  } catch (error) {
    console.error("Error fetching messages:", error);
    // If no conversation found, it's likely there are no messages yet
    return { messages: [], conversationId: null, clientInfo: null };
  }
};
