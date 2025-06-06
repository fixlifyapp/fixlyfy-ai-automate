
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Paperclip, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { generateFromEmail } from "@/utils/emailUtils";

interface EmailInputProps {
  selectedConversation: any;
  onEmailSent: () => void;
}

export const EmailInput = ({ selectedConversation, onEmailSent }: EmailInputProps) => {
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const { settings } = useCompanySettings();
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: `You are a professional customer service assistant. Generate helpful, polite, and professional emails for business communication. Keep responses concise and actionable.`
  });

  const handleSendEmail = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;

    if (!selectedConversation.client.email) {
      toast.error("No email address available for this client");
      return;
    }

    setIsSending(true);
    
    console.log('🚀 Email Send Debug Info:');
    console.log('- Subject:', subject);
    console.log('- Message:', messageText);
    console.log('- To:', selectedConversation.client.name);
    console.log('- Email:', selectedConversation.client.email);
    console.log('- Client ID:', selectedConversation.client.id);

    try {
      const companyName = settings.company_name || 'Fixlify Services';
      const fromEmail = generateFromEmail(companyName);
      
      console.log('📤 Calling send-email function...');
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: selectedConversation.client.email,
          subject: subject || `Message from ${companyName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; margin-bottom: 20px;">Hello ${selectedConversation.client.name},</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  ${messageText.replace(/\n/g, '<br>')}
                </div>
                <div style="color: #666; font-size: 14px;">
                  <p>Best regards,<br>${companyName}</p>
                  <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px;">
                    This email was sent from ${companyName}. If you have any questions, please don't hesitate to contact us.
                  </p>
                </div>
              </div>
            </div>
          `,
          text: `Hello ${selectedConversation.client.name},\n\n${messageText}\n\nBest regards,\n${companyName}`,
          companyId: selectedConversation.client.id,
          conversationId: selectedConversation.id
        }
      });

      console.log('📨 send-email response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      if (!data?.success) {
        console.error('❌ Email sending failed:', data);
        throw new Error(data?.error || 'Failed to send email');
      }

      console.log('✅ Email sent successfully via send-email');
      setSubject("");
      setMessageText("");
      toast.success("Email sent successfully");
      
      // Trigger refresh to show the new email
      setTimeout(() => {
        onEmailSent();
      }, 500);

    } catch (error) {
      console.error('💥 Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to send email: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleAISuggestion = async (prompt: string) => {
    if (isAILoading || isSending) return;

    try {
      const clientName = selectedConversation?.client.name || "the client";
      const contextualPrompt = `${prompt} for ${clientName}`;

      const suggestion = await generateText(contextualPrompt);
      
      if (suggestion) {
        setMessageText(suggestion);
        toast.success("AI suggestion applied!");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to generate suggestion");
    }
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className="bg-white">
      {/* Email Input Area */}
      <div className="p-4">
        <div className="space-y-3">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            className="border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <Textarea
                placeholder={`Type your email to ${selectedConversation.client.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isSending}
                className="min-h-[120px] max-h-[200px] resize-none border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="p-2 border-fixlyfy-border hover:bg-fixlyfy/5"
                disabled={isSending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={isSending || !messageText.trim()}
                className="px-4 py-2 bg-fixlyfy hover:bg-fixlyfy-light text-white"
                size="sm"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-fixlyfy-text-muted mt-2">
          <span>Professional email communication</span>
          {selectedConversation.client.email && (
            <span className="bg-fixlyfy/10 text-fixlyfy px-2 py-1 rounded">
              Email to {selectedConversation.client.email}
            </span>
          )}
        </div>
      </div>

      {/* AI Writing Assistant - Bottom Section */}
      <div className="border-t border-fixlyfy-border/50 bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
        <div className="p-3">
          {/* AI Toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-fixlyfy" />
              <span className="text-sm font-medium text-fixlyfy-text">AI Email Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAI(!showAI)}
              className="h-6 w-6 p-0"
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          </div>

          {/* AI Quick Actions */}
          {showAI && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a friendly professional greeting email")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Greeting"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a polite follow-up email asking about service needs")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Follow Up"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a professional appointment reminder email")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Reminder"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAISuggestion("Generate a professional thank you email for business")}
                  disabled={isAILoading || isSending}
                  className="text-xs h-8 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Thank You"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
