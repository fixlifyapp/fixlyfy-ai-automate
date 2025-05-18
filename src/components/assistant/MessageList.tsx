
import { Message } from "@/types/assistant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={cn(
            "flex gap-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-fixlyfy text-white">AI</AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <div 
              className={cn(
                "px-3 py-2 rounded-lg max-w-[80%]",
                message.role === "assistant" 
                  ? "bg-fixlyfy-bg-interface text-fixlyfy-text" 
                  : "bg-fixlyfy text-white"
              )}
            >
              <p className="text-sm">{message.content}</p>
              {message.isLoading && (
                <div className="flex space-x-1 mt-2 justify-center">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {format(new Date(message.timestamp), "h:mm a")}
            </div>
          </div>
          {message.role === "user" && (
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
};
