
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";

interface AIWritingAssistantProps {
  onUseSuggestion: (text: string) => void;
  clientName?: string;
  conversationContext?: string;
  disabled?: boolean;
}

export const AIWritingAssistant = ({ 
  onUseSuggestion, 
  clientName = "the client", 
  conversationContext = "",
  disabled = false 
}: AIWritingAssistantProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { generateText, isLoading } = useAI({
    systemContext: `You are a professional customer service assistant. Generate helpful, polite, and professional messages for business communication. Keep responses concise and actionable.`
  });

  const quickSuggestions = [
    {
      label: "Friendly greeting",
      prompt: `Generate a friendly professional greeting message to ${clientName}`
    },
    {
      label: "Follow up",
      prompt: `Generate a polite follow-up message to ${clientName} asking about their service needs`
    },
    {
      label: "Appointment reminder",
      prompt: `Generate a professional appointment reminder message for ${clientName}`
    },
    {
      label: "Thank you",
      prompt: `Generate a professional thank you message to ${clientName} for their business`
    }
  ];

  const handleQuickSuggestion = async (prompt: string) => {
    if (isLoading || disabled) return;

    try {
      const contextualPrompt = conversationContext 
        ? `${prompt}. Context of previous conversation: ${conversationContext.slice(-200)}...`
        : prompt;

      const suggestion = await generateText(contextualPrompt);
      
      if (suggestion) {
        onUseSuggestion(suggestion);
        toast.success("AI suggestion applied!");
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to generate suggestion");
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim() || isLoading || disabled) return;

    try {
      const fullPrompt = `Generate a professional message to ${clientName}: ${customPrompt}`;
      const suggestion = await generateText(fullPrompt);
      
      if (suggestion) {
        onUseSuggestion(suggestion);
        setCustomPrompt("");
        toast.success("Custom AI suggestion applied!");
      }
    } catch (error) {
      console.error("Custom AI suggestion error:", error);
      toast.error("Failed to generate custom suggestion");
    }
  };

  return (
    <div className="border-t border-fixlyfy-border/50 bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-fixlyfy" />
            <span className="text-sm font-medium text-fixlyfy-text">AI Writing Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
            disabled={disabled}
          >
            <RefreshCw className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {quickSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSuggestion(suggestion.prompt)}
              disabled={isLoading || disabled}
              className="text-xs h-8 gap-1 border-fixlyfy-border/50 hover:bg-fixlyfy/5"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {suggestion.label}
            </Button>
          ))}
        </div>

        {/* Custom Prompt */}
        {isExpanded && (
          <div className="space-y-2">
            <Textarea
              placeholder="Describe what you want to write..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading || disabled}
              className="min-h-[60px] text-sm border-fixlyfy-border/50 focus:ring-fixlyfy/20 focus:border-fixlyfy"
            />
            <Button
              onClick={handleCustomPrompt}
              disabled={!customPrompt.trim() || isLoading || disabled}
              size="sm"
              className="w-full bg-fixlyfy hover:bg-fixlyfy-light text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="h-3 w-3 mr-2" />
                  Generate Custom Message
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
