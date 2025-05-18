
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, PlusCircle } from "lucide-react";
import { MessageDialog } from "@/components/jobs/dialogs/MessageDialog";

interface JobMessagesProps {
  jobId: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  // In a real app, these would be fetched from an API based on jobId
  const messages = [
    {
      id: "msg-001",
      date: "2023-05-15",
      content: "Hello! Just confirming our appointment tomorrow at 1:30 PM.",
      sender: "technician",
      recipient: "client"
    },
    {
      id: "msg-002",
      date: "2023-05-15",
      content: "Yes, I'll be there. Thank you for the reminder.",
      sender: "client",
      recipient: "technician"
    }
  ];

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Messages</h3>
          <Button 
            onClick={() => setIsMessageDialogOpen(true)} 
            className="gap-2"
          >
            <PlusCircle size={16} />
            New Message
          </Button>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'technician' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'technician' 
                      ? 'bg-muted text-foreground' 
                      : 'bg-fixlyfy text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs text-fixlyfy-text-secondary block mt-1">
                    {new Date(message.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p>No messages yet. Send your first message.</p>
          </div>
        )}
        
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          client={{
            name: "Michael Johnson",
            phone: "(555) 123-4567"
          }}
        />
      </CardContent>
    </Card>
  );
};
