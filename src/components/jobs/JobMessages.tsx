
import { Card, CardContent } from "@/components/ui/card";
import { useJobMessages } from "./hooks/useJobMessages";
import { JobMessageList } from "./components/JobMessageList";
import { JobMessageActions } from "./components/JobMessageActions";
import { MessageInput } from "@/components/messages/MessageInput";
import { useState } from "react";

interface JobMessagesProps {
  jobId: string;
}

export const JobMessages = ({ jobId }: JobMessagesProps) => {
  const [message, setMessage] = useState("");
  
  const {
    messages,
    client,
    isLoading,
    isSendingMessage,
    isAILoading,
    handleSuggestResponse,
    handleUseSuggestion,
    handleSendMessage
  } = useJobMessages({ jobId, message, setMessage });

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <JobMessageActions 
          onSuggestResponse={handleSuggestResponse}
          isAILoading={isAILoading}
          isSendingMessage={isSendingMessage}
          messagesExist={messages.length > 0}
        />

        <JobMessageList 
          messages={messages}
          isLoading={isLoading}
        />
        
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
          isDisabled={isLoading}
        />
      </CardContent>
    </Card>
  );
};
