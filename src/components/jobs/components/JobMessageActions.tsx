
import { Button } from "@/components/ui/button";
import { Bot, Loader2, PlusCircle } from "lucide-react";

interface JobMessageActionsProps {
  onNewMessage: () => void;
  onSuggestResponse: () => void;
  isAILoading: boolean;
  isSendingMessage: boolean;
  messagesExist: boolean;
}

export const JobMessageActions = ({
  onNewMessage,
  onSuggestResponse,
  isAILoading,
  isSendingMessage,
  messagesExist
}: JobMessageActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-medium">Messages</h3>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onSuggestResponse}
          disabled={isAILoading || isSendingMessage || !messagesExist}
          className="gap-2"
        >
          {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
          {isAILoading ? "Thinking..." : "Suggest Response"}
        </Button>
        <Button 
          onClick={onNewMessage} 
          className="gap-2"
          disabled={isSendingMessage}
        >
          <PlusCircle size={16} />
          New Message
        </Button>
      </div>
    </div>
  );
};
