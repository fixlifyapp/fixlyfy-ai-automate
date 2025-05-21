
import { Loader2, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  body: string;
  direction: string;
  created_at: string;
}

interface JobMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const JobMessageList = ({ messages, isLoading }: JobMessageListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-fixlyfy" />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={32} />
        <p>No messages yet. Send your first message.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.direction === 'outbound' ? 'justify-start' : 'justify-end'}`}
        >
          <div 
            className={`max-w-[80%] p-3 rounded-lg ${
              message.direction === 'outbound' 
                ? 'bg-muted text-foreground' 
                : 'bg-fixlyfy text-white'
            }`}
          >
            <p className="text-sm">{message.body}</p>
            <span className="text-xs text-fixlyfy-text-secondary block mt-1">
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
