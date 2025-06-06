
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MessageThreadProps {
  selectedConversation: any;
}

export const MessageThread = ({ selectedConversation }: MessageThreadProps) => {
  const [isCallingLoading, setIsCallingLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return 'Unknown time';
    }
  };

  const handleCall = async () => {
    if (!selectedConversation?.client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setIsCallingLoading(true);
    try {
      console.log('Initiating call to:', selectedConversation.client.phone);
      
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: selectedConversation.client.phone,
          clientName: selectedConversation.client.name
        }
      });

      if (error) throw error;

      toast.success(`Calling ${selectedConversation.client.name}...`);
    } catch (error) {
      console.error('Error making call:', error);
      toast.error("Failed to initiate call. Please try again.");
    } finally {
      setIsCallingLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!selectedConversation?.client.email) {
      toast.error("No email address available for this client");
      return;
    }

    setIsEmailLoading(true);
    try {
      console.log('Opening email composer for:', selectedConversation.client.email);
      
      // You can implement your email composer here or use mailto
      const subject = `Message from your service provider`;
      const body = `Hello ${selectedConversation.client.name},\n\n`;
      const mailtoUrl = `mailto:${selectedConversation.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoUrl, '_blank');
      toast.success(`Email composer opened for ${selectedConversation.client.name}`);
    } catch (error) {
      console.error('Error opening email:', error);
      toast.error("Failed to open email composer. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-fixlyfy/5">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-fixlyfy/10 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-fixlyfy" />
          </div>
          <h3 className="text-xl font-semibold text-fixlyfy-text mb-3">Welcome to Messages</h3>
          <p className="text-fixlyfy-text-secondary leading-relaxed">
            Select an existing conversation from the left sidebar, or search for a client above to start a new conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Message Header */}
      <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-white to-fixlyfy/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-fixlyfy/20">
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg">
                {selectedConversation.client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-fixlyfy-text">{selectedConversation.client.name}</h3>
              {selectedConversation.client.phone && (
                <p className="text-sm text-fixlyfy-text-secondary flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedConversation.client.phone}
                </p>
              )}
              {selectedConversation.client.email && (
                <p className="text-sm text-fixlyfy-text-secondary flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {selectedConversation.client.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedConversation.client.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-fixlyfy-border hover:bg-fixlyfy/5"
                onClick={handleCall}
                disabled={isCallingLoading}
              >
                {isCallingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                Call
              </Button>
            )}
            {selectedConversation.client.email && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-fixlyfy-border hover:bg-fixlyfy/5"
                onClick={handleEmail}
                disabled={isEmailLoading}
              >
                {isEmailLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Email
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-fixlyfy-bg-interface">
        {selectedConversation.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-full p-6 mx-auto mb-4 w-16 h-16 flex items-center justify-center shadow-sm">
              <MessageSquare className="h-8 w-8 text-fixlyfy-text-muted" />
            </div>
            <h4 className="font-medium text-fixlyfy-text mb-2">Start the conversation</h4>
            <p className="text-fixlyfy-text-secondary text-sm">Send your first message to {selectedConversation.client.name}</p>
          </div>
        ) : (
          selectedConversation.messages.map((message: any) => {
            const isFromClient = message.direction === 'inbound';
            const displaySender = isFromClient ? selectedConversation.client.name : 'You';
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  !isFromClient && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-xs font-medium",
                    isFromClient 
                      ? "bg-fixlyfy-text-muted/20 text-fixlyfy-text" 
                      : "bg-fixlyfy text-white"
                  )}>
                    {isFromClient 
                      ? selectedConversation.client.name.substring(0, 2).toUpperCase()
                      : 'ME'
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col max-w-[75%]",
                  !isFromClient && "items-end"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl shadow-sm",
                    isFromClient 
                      ? "bg-white text-fixlyfy-text rounded-bl-md border border-fixlyfy-border/50" 
                      : "bg-fixlyfy text-white rounded-br-md"
                  )}>
                    <p className="text-sm break-words leading-relaxed">{message.body}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-xs text-fixlyfy-text-muted",
                    !isFromClient && "flex-row-reverse"
                  )}>
                    <span className="font-medium">{displaySender}</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatMessageTime(message.created_at)}</span>
                    {!isFromClient && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-xs",
                        message.status === 'delivered' ? "bg-fixlyfy-success/20 text-fixlyfy-success" :
                        message.status === 'sent' ? "bg-fixlyfy-info/20 text-fixlyfy-info" :
                        message.status === 'failed' ? "bg-fixlyfy-error/20 text-fixlyfy-error" :
                        "bg-fixlyfy-warning/20 text-fixlyfy-warning"
                      )}>
                        {message.status || 'sending'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
