
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import { shouldRefreshAIInsights, updateLastRefreshTimestamp } from "@/utils/ai-refresh";
import { AIResponse, BusinessMetrics } from "@/types/database";

interface UseAIOptions {
  systemContext?: string;
  mode?: "text" | "insights" | "analytics" | "recommendations" | "business";
  temperature?: number;
  maxTokens?: number;
  fetchBusinessData?: boolean;
  forceRefresh?: boolean;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<BusinessMetrics | null>(null);
  const { user } = useAuth();
  
  const generateText = async (prompt: string, customOptions?: Partial<UseAIOptions>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending AI request with prompt:", prompt);
      
      // Check if we need to refresh insights based on time
      const shouldRefresh = customOptions?.forceRefresh || options.forceRefresh || await shouldRefreshAIInsights();
      
      const { data, error } = await supabase.functions.invoke<AIResponse>("generate-with-ai", {
        body: {
          prompt,
          context: customOptions?.systemContext || options.systemContext,
          mode: customOptions?.mode || options.mode || "text",
          temperature: customOptions?.temperature || options.temperature || 0.7,
          maxTokens: customOptions?.maxTokens || options.maxTokens || 800,
          fetchBusinessData: customOptions?.fetchBusinessData !== undefined ? 
            customOptions.fetchBusinessData : options.fetchBusinessData,
          userId: user?.id,
          forceRefresh: shouldRefresh
        }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }
      
      if (!data || !data.generatedText) {
        console.error("Missing generatedText in response:", data);
        throw new Error("Invalid response format from AI service");
      }
      
      console.log("AI response data:", data);
      
      // Store business data if returned
      if (data.businessData) {
        setBusinessData(data.businessData);
      }
      
      // Update the refresh timestamp if successful
      if (shouldRefresh) {
        updateLastRefreshTimestamp();
      }
      
      return data.generatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI response';
      setError(errorMessage);
      console.error("AI generation error:", err);
      toast.error("AI Error", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateInsights = useCallback(async (data: any, topic: string, customOptions?: Partial<UseAIOptions>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke<AIResponse>("generate-with-ai", {
        body: {
          prompt: `Generate business insights about ${topic}`,
          context: customOptions?.systemContext || options.systemContext || "You are a business analyst.",
          mode: "insights",
          data: data,
          temperature: customOptions?.temperature || options.temperature || 0.7,
          maxTokens: customOptions?.maxTokens || options.maxTokens || 800,
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
  }, [options]);
  
  const generateAnalytics = useCallback(async (metrics: any, timeframe: string = "last month", customOptions?: Partial<UseAIOptions>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke<AIResponse>("generate-with-ai", {
        body: {
          prompt: `Analyze these business metrics for ${timeframe}`,
          context: customOptions?.systemContext || options.systemContext || "You are a business analyst.",
          mode: "analytics",
          data: metrics,
          temperature: customOptions?.temperature || options.temperature || 0.3,
          maxTokens: customOptions?.maxTokens || options.maxTokens || 600,
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
  }, [options]);
  
  const generateRecommendations = useCallback(async (data: any, subject: string, customOptions?: Partial<UseAIOptions>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke<AIResponse>("generate-with-ai", {
        body: {
          prompt: `Generate personalized recommendations about ${subject}`,
          context: customOptions?.systemContext || options.systemContext || "You are a business consultant.",
          mode: "recommendations",
          data: data,
          temperature: customOptions?.temperature || options.temperature || 0.6,
          maxTokens: customOptions?.maxTokens || options.maxTokens || 700,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return response.generatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMessage);
      console.error("AI recommendations error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  const generateBusinessInsights = useCallback(async (prompt: string, customOptions?: Partial<UseAIOptions>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we need to refresh insights
      const shouldRefresh = customOptions?.forceRefresh || options.forceRefresh || await shouldRefreshAIInsights();
      
      const { data: response, error } = await supabase.functions.invoke<AIResponse>("generate-with-ai", {
        body: {
          prompt: prompt,
          context: customOptions?.systemContext || options.systemContext || "You are an AI business assistant with access to the company's business metrics and data. Provide specific, data-backed insights.",
          mode: "business",
          temperature: customOptions?.temperature || options.temperature || 0.4,
          maxTokens: customOptions?.maxTokens || options.maxTokens || 1000,
          fetchBusinessData: true,
          forceRefresh: shouldRefresh,
          userId: user?.id
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (response.businessData) {
        setBusinessData(response.businessData);
        console.log("Business data received:", response.businessData);
      }
      
      // Update the refresh timestamp if successful
      if (shouldRefresh) {
        updateLastRefreshTimestamp();
      }
      
      return response.generatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate business insights';
      setError(errorMessage);
      console.error("AI business insights error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options, user]);
  
  return {
    generateText,
    generateInsights,
    generateAnalytics,
    generateRecommendations,
    generateBusinessInsights,
    businessData,
    isLoading,
    error
  };
}
