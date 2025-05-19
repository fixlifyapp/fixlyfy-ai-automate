
import { useState } from "react";
import { createClient } from "@/integrations/supabase/client";

interface UseAIOptions {
  systemContext?: string;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  
  const generateText = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-with-ai", {
        body: {
          prompt,
          context: options.systemContext
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.generatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI response';
      setError(errorMessage);
      console.error("AI generation error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateText,
    isLoading,
    error
  };
}
