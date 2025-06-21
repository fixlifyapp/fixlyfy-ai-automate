import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendMessageParams {
  content: string;
  clientPhone: string;
  jobId?: string;
  clientId?: string;
  existingConversationId?: string | null;
}

interface MessageResult {
  success: boolean;
  error?: string;
  conversationId?: string;
}

export const sendClientMessage = async ({
  content,
  clientPhone,
  jobId = "",
  clientId,
  existingConversationId
}: SendMessageParams): Promise<MessageResult> => {
  console.log("sendClientMessage called with:", {
    content: content.substring(0, 50) + "...",
    clientPhone,
    jobId,
    clientId,
    existingConversationId
  });

  if (!content.trim()) {
    console.error("Message content is empty");
    return { success: false, error: "Message content cannot be empty" };
  }

  if (!clientPhone) {
    console.error("Client phone number is required");
    return { success: false, error: "Client phone number is required" };
  }

  try {
    console.log("Calling telnyx-sms function...");
    
    // Get current user ID for message storage
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.error("User not authenticated");
      return { success: false, error: "User authentication required" };
    }
    
    // For connect center messages (no jobId), we need to find or create a conversation
    let conversationId = existingConversationId;
    
    if (!conversationId && clientId) {
      // Try to find an existing active conversation for this client
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
        .limit(1);
      
      if (conversations && conversations.length > 0) {
        conversationId = conversations[0].id;
        console.log("Found existing conversation:", conversationId);
      } else {
        // Create a new conversation without jobId for connect center
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: clientId,
            job_id: jobId || null, // Allow null for connect center
            status: 'active',
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (convError) {
          console.error("Error creating conversation:", convError);
        } else if (newConversation) {
          conversationId = newConversation.id;
          console.log("Created new conversation:", conversationId);
        }
      }
    }
    
    // The telnyx-sms function now handles secure portal link generation automatically
    // Pass conversation_id if we have it
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: clientPhone,
        message: content,
        client_id: clientId || '',
        job_id: jobId || '',
        user_id: userId,
        conversation_id: conversationId // Pass conversation ID to edge function
      }
    });

    console.log("telnyx-sms response:", { data, error });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message || 'Failed to send message');
    }

    if (!data?.success) {
      console.error("SMS sending failed:", data);
      throw new Error(data?.error || 'Failed to send message');
    }

    console.log("Message sent successfully via telnyx-sms");
    
    // Trigger a manual refresh after successful send
    if (conversationId) {
      // Force a refresh by updating the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    }
    
    return { 
      success: true, 
      conversationId: conversationId || undefined
    };

  } catch (error) {
    console.error("Error in sendClientMessage:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage
    };
  }
};
