
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
    
    // Check if content already contains a portal.fixlify.app link
    const hasPortalLink = content.includes('portal.fixlify.app');
    let finalContent = content;
    
    // If no portal link exists and we have client/job info, generate one
    if (!hasPortalLink && (clientId || jobId)) {
      try {
        // Generate secure access token
        const accessToken = btoa(Math.random().toString()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
        const expiresAt = new Date(Date.now() + (72 * 60 * 60 * 1000)); // 72 hours

        // Store portal access in database
        const { error: portalError } = await supabase
          .from('client_portal_access')
          .insert({
            access_token: accessToken,
            client_id: clientId || '',
            document_type: 'portal',
            document_id: crypto.randomUUID(),
            expires_at: expiresAt.toISOString(),
            permissions: {
              view_estimates: true,
              view_invoices: true,
              make_payments: false
            },
            domain_restriction: 'portal.fixlify.app'
          });

        if (!portalError) {
          // Generate new portal URL format
          const portalUrl = jobId 
            ? `https://portal.fixlify.app/portal/${accessToken}/${jobId}`
            : `https://portal.fixlify.app/portal/${accessToken}`;
          
          finalContent = `${content}\n\nView details: ${portalUrl}`;
          console.log("Added portal link to message:", portalUrl);
        }
      } catch (portalError) {
        console.warn("Failed to generate portal link:", portalError);
        // Continue with original message if portal generation fails
      }
    }
    
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: clientPhone,
        message: finalContent,
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
