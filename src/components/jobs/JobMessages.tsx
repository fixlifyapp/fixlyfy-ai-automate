
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageDialog } from "@/components/messages/MessageDialog";
import { useJobMessages } from "./hooks/useJobMessages";
import { JobMessageList } from "./components/JobMessageList";
import { JobMessageActions } from "./components/JobMessageActions";

interface JobMessagesProps {
  jobId: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  const {
    messages,
    client,
    isLoading,
    isSendingMessage,
    isAILoading,
    handleSuggestResponse,
    handleUseSuggestion
  } = useJobMessages({ jobId });

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <JobMessageActions 
          onNewMessage={() => setIsMessageDialogOpen(true)}
          onSuggestResponse={handleSuggestResponse}
          isAILoading={isAILoading}
          isSendingMessage={isSendingMessage}
          messagesExist={messages.length > 0}
        />

        <JobMessageList 
          messages={messages}
          isLoading={isLoading}
        />
        
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          client={client}
        />
      </CardContent>
    </Card>
  );
};
