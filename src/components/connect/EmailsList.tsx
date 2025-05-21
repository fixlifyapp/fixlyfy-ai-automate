
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Star, Loader2, ArrowRight } from "lucide-react";
import { clients } from "@/data/clients";
import { toast } from "@/components/ui/sonner";

interface Email {
  id: string;
  clientId: string;
  clientName: string;
  emailAddress: string;
  subject: string;
  excerpt: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
}

export const EmailsList = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock email data
      const subjects = [
        "Schedule confirmation",
        "Service feedback",
        "Quote request",
        "Appointment change",
        "Invoice question",
        "Warranty information"
      ];
      
      const excerpts = [
        "I'd like to confirm my appointment for next...",
        "Thank you for the service yesterday. I wanted to...",
        "Can you please send me a quote for...",
        "I need to reschedule the appointment we have...",
        "I have a question about the invoice I received...",
        "Could you provide more information about..."
      ];
      
      const mockEmails: Email[] = [];
      for (let i = 0; i < 15; i++) {
        const client = clients[i % clients.length];
        mockEmails.push({
          id: `email-${i}`,
          clientId: client.id,
          clientName: client.name,
          emailAddress: client.email || "client@example.com",
          subject: subjects[i % subjects.length],
          excerpt: excerpts[i % excerpts.length],
          timestamp: new Date(Date.now() - i * 3600000 * (Math.random() * 10 + 1)).toLocaleString(),
          isRead: i % 3 !== 0,
          isStarred: i % 5 === 0
        });
      }
      setEmails(mockEmails);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (email: Email) => {
    setEmails(emails.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ));
    setSelectedEmail(email);
  };

  const handleStarEmail = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, isStarred: !e.isStarred } : e
    ));
  };

  const handleReplyEmail = (email: Email) => {
    toast.info(`Replying to ${email.clientName}...`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-fixlyfy-border">
        <CardHeader className="pb-2">
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-fixlyfy" />
            </div>
          ) : (
            <div className="h-[500px] overflow-y-auto">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className={`flex items-start p-4 border-b border-fixlyfy-border hover:bg-fixlyfy-bg-hover cursor-pointer ${!email.isRead ? 'bg-fixlyfy-bg-hover' : ''}`}
                  onClick={() => handleMarkAsRead(email)}
                >
                  <div className="mr-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{email.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${!email.isRead ? 'font-semibold' : ''}`}>{email.clientName}</h3>
                      <div className="flex items-center">
                        <span className="text-xs text-fixlyfy-text-secondary mr-2">
                          {new Date(email.timestamp).toLocaleDateString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleStarEmail(email.id, e)}
                        >
                          <Star 
                            size={16} 
                            className={email.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} 
                          />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{email.subject}</p>
                    <p className="text-sm text-fixlyfy-text-secondary truncate">{email.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-fixlyfy-border">
        <CardContent className="p-6 h-[560px] flex flex-col">
          {selectedEmail ? (
            <>
              <div className="mb-4 pb-4 border-b border-fixlyfy-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReplyEmail(selectedEmail)}
                    className="flex items-center gap-1"
                  >
                    Reply <ArrowRight size={14} />
                  </Button>
                </div>
                <div className="flex items-center mt-2 text-sm text-fixlyfy-text-secondary">
                  <span className="font-medium text-foreground mr-2">From: {selectedEmail.clientName}</span> 
                  <span className="mr-2">{`<${selectedEmail.emailAddress}>`}</span>
                  <Clock size={14} className="mr-1" /> 
                  <span>{selectedEmail.timestamp}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-sm leading-relaxed">
                  Dear Support Team,<br/><br/>
                  {selectedEmail.excerpt} This is a placeholder for the full email content that would be loaded from the database in a real application.
                  <br/><br/>
                  I would appreciate your assistance with this matter at your earliest convenience.
                  <br/><br/>
                  Best regards,<br/>
                  {selectedEmail.clientName}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-fixlyfy-text-secondary">
              <Mail className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Email Selected</h3>
              <p className="text-center max-w-sm">
                Select an email from the inbox to view its contents.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
