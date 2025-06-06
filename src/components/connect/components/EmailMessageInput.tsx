
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailMessageInputProps {
  selectedConversation: any;
  onMessageSent: () => void;
}

export const EmailMessageInput = ({ selectedConversation, onMessageSent }: EmailMessageInputProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!message.trim() || !selectedConversation || isSending) return;

    setIsSending(true);

    try {
      console.log('📧 Sending email to:', selectedConversation.client?.name);
      
      let conversationId = selectedConversation.id;
      
      // Handle new email conversations or check for archived ones
      if (conversationId.startsWith('new_email_')) {
        console.log('📝 Creating new email conversation or checking for archived');
        
        // First check if ANY email conversation exists for this client (including archived ones)
        const { data: existingConv, error: checkError } = await supabase
          .from('email_conversations')
          .select('id, status')
          .eq('client_id', selectedConversation.client.id)
          .order('last_message_at', { ascending: false })
          .limit(1)
          .single();

        if (!checkError && existingConv) {
          conversationId = existingConv.id;
          console.log('✅ Found existing email conversation:', conversationId, 'with status:', existingConv.status);
          
          // If it's archived, restore it
          if (existingConv.status === 'archived') {
            console.log('🔄 Restoring archived email conversation:', conversationId);
            const { error: restoreError } = await supabase
              .from('email_conversations')
              .update({ 
                status: 'active',
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', conversationId);

            if (restoreError) {
              console.error('⚠️ Error restoring email conversation:', restoreError);
            } else {
              console.log('✅ Email conversation restored to active status');
            }
          } else {
            // Update last_message_at for active conversation
            const { error: updateError } = await supabase
              .from('email_conversations')
              .update({ 
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', conversationId);

            if (updateError) {
              console.error('⚠️ Error updating email conversation:', updateError);
            }
          }
        } else {
          // Create new email conversation
          const { data: newConv, error: createError } = await supabase
            .from('email_conversations')
            .insert({
              client_id: selectedConversation.client.id,
              subject: subject || `Email conversation with ${selectedConversation.client.name}`,
              status: 'active',
              last_message_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (createError) throw createError;
          conversationId = newConv.id;
          console.log('🆕 Created new email conversation:', conversationId);
        }
      } else {
        // For existing conversation IDs, ensure they're active
        console.log('🔄 Ensuring email conversation is active:', conversationId);
        const { error: restoreError } = await supabase
          .from('email_conversations')
          .update({ 
            status: 'active',
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);

        if (restoreError) {
          console.error('⚠️ Error updating email conversation:', restoreError);
        } else {
          console.log('✅ Email conversation ensured active status');
        }
      }

      // Send the email message via Mailgun
      const { data, error } = await supabase.functions.invoke('mailgun-send-email', {
        body: {
          to: selectedConversation.client?.email,
          subject: subject || 'Message from Fixlyfy',
          text: message,
          client_id: selectedConversation.client?.id,
          conversation_id: conversationId
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to send email');
      }

      console.log('✅ Email sent successfully');
      toast.success('Email sent successfully');
      setSubject("");
      setMessage("");
      
      // Call the callback to refresh conversations
      setTimeout(() => {
        onMessageSent();
      }, 500);

    } catch (error) {
      console.error('❌ Error sending email:', error);
      toast.error('Failed to send email: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedConversation) {
    return (
      <div className="p-4 text-center text-fixlyfy-text-muted bg-fixlyfy-bg-interface border-t border-fixlyfy-border">
        Select a conversation to start emailing
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-t border-fixlyfy-border space-y-3">
      <Input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Email subject..."
        className="border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
        disabled={isSending}
      />
      
      <div className="flex gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Send an email to ${selectedConversation.client?.name}...`}
          className="flex-1 min-h-[80px] max-h-40 resize-none border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
          disabled={isSending}
        />
        <Button
          onClick={handleSendEmail}
          disabled={!message.trim() || isSending}
          className="self-end bg-fixlyfy hover:bg-fixlyfy-light text-white px-6 h-[80px]"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
