
import { Card, CardContent } from "@/components/ui/card";
import { useJobMessages } from "./hooks/useJobMessages";
import { JobMessageList } from "./components/JobMessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Messages</h3>
              {client.name && (
                <p className="text-sm text-muted-foreground">
                  Conversation with {client.name}
                  {client.phone && ` (${client.phone})`}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSuggestResponse}
              disabled={isAILoading || isLoading || messages.length === 0}
              className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {isAILoading ? (
                <>
                  <Bot className="h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Response
                </>
              )}
            </Button>
          </div>
        </div>

        <JobMessageList 
          messages={messages}
          isLoading={isLoading}
          clientName={client.name}
        />
        
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
          isDisabled={isLoading}
          showSuggestResponse={true}
          onSuggestResponse={handleSuggestResponse}
          isAILoading={isAILoading}
          clientInfo={client}
          messages={messages}
        />
      </CardContent>
    </Card>
  );
};
