
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";

interface UseMessageAIProps {
  messages: any[];
  onUseSuggestion: (content: string) => void;
}

export const useMessageAI = ({ messages, onUseSuggestion }: UseMessageAIProps) => {
  const { generateText, isLoading: isAILoading } = useAI({
    systemContext: "You are an assistant helping with job messaging for a field service company. Keep responses professional, friendly, and concise."
  });

  const handleSuggestResponse = async () => {
    if (isAILoading) return;
    
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.direction === "outbound") {
        toast.info("Waiting for client response before suggesting a reply.");
        return;
      }
      
      const prompt = `Generate a professional response to this customer message: "${lastMessage.body}"`;
      const suggestedResponse = await generateText(prompt);
      
      if (suggestedResponse) {
        toast.success("AI suggestion ready", {
          description: suggestedResponse,
          action: {
            label: "Use",
            onClick: () => {
              onUseSuggestion(suggestedResponse);
            }
          }
        });
      }
    } catch (error) {
      toast.error("Failed to generate response suggestion");
    }
  };

  return {
    isAILoading,
    handleSuggestResponse
  };
};
