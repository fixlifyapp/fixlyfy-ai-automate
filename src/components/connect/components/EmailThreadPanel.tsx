
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { EmailMessageInput } from "./EmailMessageInput";

interface EmailConversation {
  id: string;
  subject: string;
  last_message_at: string;
  status: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  emails: any[];
}

interface EmailThreadPanelProps {
  selectedConversation: EmailConversation | null;
  onMessageSent: () => void;
}

export const EmailThreadPanel = ({
  selectedConversation,
  onMessageSent
}: EmailThreadPanelProps) => {
  return (
    <div className="h-full flex flex-col bg-fixlyfy-bg-interface">
      <div className="flex-1 overflow-hidden">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Thread Header */}
            <div className="p-4 border-b border-fixlyfy-border/50 bg-white">
              <h3 className="font-semibold text-fixlyfy-text mb-1">
                {selectedConversation.client?.name || 'Unknown Client'}
              </h3>
              <p className="text-sm text-fixlyfy-text-secondary mb-2">
                {selectedConversation.client?.email}
              </p>
              <p className="text-sm font-medium text-fixlyfy-text">
                {selectedConversation.subject}
              </p>
            </div>
            
            {/* Email Messages */}
            <ScrollArea className="flex-1 p-4">
              {selectedConversation.emails.length === 0 ? (
                <div className="text-center py-8 text-fixlyfy-text-muted">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-fixlyfy-text-muted" />
                  <p>No emails yet</p>
                  <p className="text-xs mt-1">Start the conversation below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedConversation.emails.map((email, index) => (
                    <Card key={index} className="max-w-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-fixlyfy-text">
                            {email.direction === 'inbound' ? email.sender_email : 'You'}
                          </span>
                          <span className="text-xs text-fixlyfy-text-muted">
                            {new Date(email.created_at).toLocaleString()}
                          </span>
                        </div>
                        {email.subject && (
                          <p className="text-sm font-medium text-fixlyfy-text mb-2">
                            Subject: {email.subject}
                          </p>
                        )}
                        <div className="text-sm text-fixlyfy-text-secondary">
                          {email.body_text || email.body_html?.replace(/<[^>]*>/g, '') || 'No content'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <Mail className="h-12 w-12 mx-auto mb-4 text-fixlyfy-text-muted" />
              <h3 className="text-lg font-medium text-fixlyfy-text mb-2">No conversation selected</h3>
              <p className="text-fixlyfy-text-secondary">
                Select an email conversation from the list or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Email Input */}
      <div className="border-t border-fixlyfy-border/50">
        <EmailMessageInput 
          selectedConversation={selectedConversation}
          onMessageSent={onMessageSent}
        />
      </div>
    </div>
  );
};
