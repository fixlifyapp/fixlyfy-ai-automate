
import { useState, FormEvent } from "react";
import { Send, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled = false }: MessageInputProps) => {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex flex-col gap-2">
        {isExpanded ? (
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a detailed message..."
            disabled={disabled}
            className="min-h-[100px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        ) : (
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={disabled}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            onFocus={() => setIsExpanded(true)}
          />
        )}
        
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            disabled={disabled}
            onClick={() => console.log("Voice input not implemented")}
          >
            <Mic size={20} />
          </Button>
          
          <div className="flex gap-2">
            {isExpanded && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-fixlyfy" 
              size="sm"
              disabled={!input.trim() || disabled}
            >
              <Send size={16} className="mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
