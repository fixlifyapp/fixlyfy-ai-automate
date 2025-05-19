
import { useState } from "react";
import { useAI } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InsightsGeneratorProps {
  data: any;
  topic: string;
  onInsightsGenerated?: (insights: string) => void;
  className?: string;
  mode?: "insights" | "analytics" | "recommendations";
  systemContext?: string;
  variant?: "card" | "inline" | "compact";
  autoGenerate?: boolean;
}

export const InsightsGenerator = ({
  data,
  topic,
  onInsightsGenerated,
  className,
  mode = "insights",
  systemContext,
  variant = "inline",
  autoGenerate = false
}: InsightsGeneratorProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { generateInsights, generateAnalytics, generateText, error } = useAI({
    systemContext,
    mode: mode
  });
  
  const generateContent = async () => {
    setIsGenerating(true);
    toast.loading(`Generating AI ${mode}...`);
    
    try {
      let result;
      
      if (mode === "insights") {
        result = await generateInsights(data, topic);
      } else if (mode === "analytics") {
        result = await generateAnalytics(data);
      } else if (mode === "recommendations") {
        result = await generateText(`Generate personalized recommendations about ${topic} based on this data: ${JSON.stringify(data)}`);
      }
      
      if (result) {
        setInsights(result);
        if (onInsightsGenerated) {
          onInsightsGenerated(result);
        }
        toast.dismiss();
        toast.success(`AI ${mode} generated`);
      }
    } catch (err) {
      console.error(`Failed to generate ${mode}:`, err);
      toast.dismiss();
      toast.error(`Failed to generate ${mode}`, {
        description: "Please check your OpenAI API key and try again"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Auto-generate insights on component mount if enabled
  useState(() => {
    if (autoGenerate && !insights) {
      generateContent();
    }
  });
  
  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (insights) {
      return (
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
      );
    }
    
    return (
      <div className="flex justify-center">
        <Button
          onClick={generateContent}
          disabled={isGenerating}
          className={variant === "compact" ? "text-sm h-8 px-3" : "bg-fixlyfy"}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating {mode}...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate {mode}
            </>
          )}
        </Button>
      </div>
    );
  };
  
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {renderContent()}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-medium">
            AI {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </h3>
        </div>
        <Badge className="bg-fixlyfy-success">AI Powered</Badge>
      </div>
      
      {renderContent()}
    </div>
  );
};
