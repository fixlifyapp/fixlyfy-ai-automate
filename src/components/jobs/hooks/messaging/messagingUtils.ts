
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
    console.log('messagingUtils: Finding or creating conversation for client:', clientId);
    
    // First, try to find existing conversation for this client
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConversation) {
      console.log('messagingUtils: Found existing conversation:', existingConversation.id);
      return existingConversation.id;
    }

    // Create new conversation only if none exists
    const conversationData: any = {
      client_id: clientId,
      status: 'active',
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add job_id if provided
    if (jobId) {
      conversationData.job_id = jobId;
    }

    console.log('messagingUtils: Creating new conversation with data:', conversationData);

    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select('id')
      .single();

    if (error) {
      console.error('messagingUtils: Error creating conversation:', error);
      return null;
    }

    console.log('messagingUtils: Created new conversation:', newConversation.id);
    return newConversation.id;
  } catch (error) {
    console.error('messagingUtils: Error in findOrCreateConversation:', error);
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
    console.log('messagingUtils: Sending message to client:', { clientPhone, clientId, jobId });
    
    // Call the Telnyx SMS edge function
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        to: clientPhone,
        body: content,
        client_id: clientId,
        job_id: jobId
      }
    });
    
    if (error) {
      console.error('messagingUtils: Supabase function error:', error);
      throw new Error(error.message);
    }
    
    if (data.success) {
      console.log('messagingUtils: SMS sent successfully via Telnyx');
      
      // Find or create conversation - always check for existing first
      let conversationId = existingConversationId;
      
      if (!conversationId) {
        conversationId = await findOrCreateConversation(clientId, jobId);
      }
      
      // Store the message in the database
      if (conversationId) {
        console.log('messagingUtils: Storing message in conversation:', conversationId);
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            body: content,
            direction: 'outbound',
            sender: 'You',
            recipient: clientPhone,
            status: 'delivered',
            message_sid: data.data?.id || 'unknown',
            created_at: new Date().toISOString()
          });
          
        if (messageError) {
          console.error('messagingUtils: Error storing message:', messageError);
        }
          
        // Update conversation timestamp
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ 
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
          
        if (updateError) {
          console.error('messagingUtils: Error updating conversation timestamp:', updateError);
        }
      }
      
      return { success: true, conversationId };
    } else {
      console.error('messagingUtils: SMS sending failed:', data);
      toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error: any) {
    console.error("messagingUtils: Error sending message:", error);
    toast.error("Failed to send message to client");
    return { success: false, error: error.message };
  }
};

export const fetchJobClientDetails = async (jobId: string) => {
  try {
    console.log('messagingUtils: Fetching client details for job:', jobId);
    
    const { data: job } = await supabase
      .from('jobs')
      .select(`
        *,
        clients:client_id(*)
      `)
      .eq('id', jobId)
      .single();
    
    if (job && job.clients) {
      const clientDetails = {
        name: job.clients.name,
        phone: job.clients.phone || "",
        id: job.clients.id,
        email: job.clients.email || ""
      };
      
      console.log('messagingUtils: Found client details:', clientDetails);
      return clientDetails;
    }
    
    console.log('messagingUtils: No client found for job:', jobId);
    return null;
  } catch (error) {
    console.error("messagingUtils: Error fetching job details:", error);
    toast.error("Failed to load client information");
    return null;
  }
};

export const fetchConversationMessages = async (jobId: string) => {
  try {
    console.log('messagingUtils: Fetching conversation messages for job:', jobId);
    
    // First find the conversation for this job's client
    const { data: job } = await supabase
      .from('jobs')
      .select('client_id')
      .eq('id', jobId)
      .single();

    if (!job?.client_id) {
      console.log('messagingUtils: No client_id found for job:', jobId);
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
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (conversation) {
      console.log('messagingUtils: Found conversation:', conversation.id);
      
      // Fetch messages for this conversation with proper ordering
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      
      if (messagesData) {
        console.log('messagingUtils: Found', messagesData.length, 'messages');
        return { 
          messages: messagesData, 
          conversationId: conversation.id,
          clientInfo: conversation.clients
        };
      }
    }
    
    console.log('messagingUtils: No conversation found for client:', job.client_id);
    return { messages: [], conversationId: null, clientInfo: null };
  } catch (error) {
    console.error("messagingUtils: Error fetching messages:", error);
    // If no conversation found, it's likely there are no messages yet
    return { messages: [], conversationId: null, clientInfo: null };
  }
};
