
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
      
      // First, restore email conversation if it's archived
      if (selectedConversation.id && !selectedConversation.id.startsWith('new_email_')) {
        console.log('🔄 Checking if email conversation needs to be restored from archive');
        const { error: restoreError } = await supabase
          .from('email_conversations')
          .update({ 
            status: 'active',
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedConversation.id);

        if (restoreError) {
          console.error('⚠️ Error restoring email conversation:', restoreError);
        } else {
          console.log('✅ Email conversation restored to active status');
        }
      }

      // Send the email message via Mailgun
      const { data, error } = await supabase.functions.invoke('mailgun-send-email', {
        body: {
          to: selectedConversation.client?.email,
          subject: subject || 'Message from Fixlyfy',
          text: message,
          client_id: selectedConversation.client?.id
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
