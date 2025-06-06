
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
    
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        to: clientPhone,
        body: content.trim(),
        client_id: clientId || '',
        job_id: jobId || ''
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
    return { 
      success: true, 
      conversationId: existingConversationId || undefined
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
