
import { useState } from "react";
import { useAI } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightsGeneratorProps {
  data: any;
  topic: string;
  onInsightsGenerated?: (insights: string) => void;
  className?: string;
  mode?: "insights" | "analytics";
  systemContext?: string;
}

export const InsightsGenerator = ({
  data,
  topic,
  onInsightsGenerated,
  className,
  mode = "insights",
  systemContext
}: InsightsGeneratorProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { generateInsights, generateAnalytics, error } = useAI({
    systemContext,
    mode: mode
  });
  
  const generateContent = async () => {
    setIsGenerating(true);
    try {
      let result;
      
      if (mode === "insights") {
        result = await generateInsights(data, topic);
      } else {
        result = await generateAnalytics(data);
      }
      
      if (result) {
        setInsights(result);
        if (onInsightsGenerated) {
          onInsightsGenerated(result);
        }
      }
    } catch (err) {
      console.error("Failed to generate insights:", err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-medium">AI {mode === "insights" ? "Insights" : "Analysis"}</h3>
        </div>
        <Badge className="bg-fixlyfy-success">AI Powered</Badge>
      </div>
      
      {error && (
        <div className="p-4 border border-fixlyfy-error/20 bg-fixlyfy-error/5 rounded-md">
          <p className="text-fixlyfy-error text-sm">{error}</p>
        </div>
      )}
      
      {insights ? (
        <div className="border border-fixlyfy-border rounded-md p-4 bg-fixlyfy/5">
          <div className="prose prose-sm max-w-none">
            {insights.split('\n').map((line, i) => (
              <p key={i} className={line.startsWith('•') ? "flex items-start" : ""}>
                {line.startsWith('•') ? (
                  <>
                    <span className="mr-2 flex-shrink-0">•</span>
                    <span>{line.substring(1)}</span>
                  </>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={generateContent}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={generateContent}
            disabled={isGenerating}
            className="bg-fixlyfy"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {mode === "insights" ? "Insights" : "Analysis"}...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate {mode === "insights" ? "Insights" : "Analysis"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
