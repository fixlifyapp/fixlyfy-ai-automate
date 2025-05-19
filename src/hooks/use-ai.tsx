
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseAIOptions {
  systemContext?: string;
  mode?: "text" | "insights" | "analytics";
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateText = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-with-ai", {
        body: {
          prompt,
          context: options.systemContext,
          mode: options.mode || "text"
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
  
  const generateInsights = async (data: any, topic: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke("generate-with-ai", {
        body: {
          prompt: `Generate business insights about ${topic}`,
          context: options.systemContext,
          mode: "insights",
          data: data
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return response.generatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      console.error("AI insights error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateAnalytics = async (metrics: any, timeframe: string = "last month") => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke("generate-with-ai", {
        body: {
          prompt: `Analyze these business metrics for ${timeframe}`,
          context: options.systemContext,
          mode: "analytics",
          data: metrics
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return response.generatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate analytics';
      setError(errorMessage);
      console.error("AI analytics error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateText,
    generateInsights,
    generateAnalytics,
    isLoading,
    error
  };
}
