
import { useState } from "react";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, RefreshCw, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTestData } from "@/utils/test-data-generator";

// Example data - in a real implementation, this would come from your API or state
const businessMetrics = {
  revenue: {
    current: 24680,
    previous: 21340,
    trend: 15.7
  },
  jobs: {
    completed: 127,
    scheduled: 45,
    canceled: 8
  },
  customers: {
    new: 24,
    returning: 103,
    satisfaction: 4.7
  },
  technicians: {
    utilization: 78,
    efficiency: 82,
    topPerformer: "Robert Smith"
  }
};

export const BusinessInsights = () => {
  const [insights, setInsights] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  
  const { generateAllTestData } = useTestData();
  
  const testOpenAI = async () => {
    try {
      setTestStatus("idle");
      const result = await fetch("/api/test-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Test connection" }),
      });
      
      if (!result.ok) {
        throw new Error("Failed to connect to OpenAI");
      }
      
      setTestStatus("success");
      toast.success("OpenAI connection successful!", {
        description: "Your AI insights feature is ready to use"
      });
    } catch (error) {
      setTestStatus("error");
      toast.error("OpenAI connection failed", {
        description: "Please check your API key and try again"
      });
      console.error("OpenAI test error:", error);
    }
  };

  const handleGenerateTestData = async () => {
    setIsGeneratingData(true);
    toast.loading("Generating test data for Toronto & GTA...");
    
    try {
      // In a real implementation, this would call your API to store data
      await generateAllTestData();
      
      toast.dismiss();
      toast.success("Test data created successfully", {
        description: "20 clients and 40 jobs across Toronto & GTA created"
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate test data", {
        description: "An error occurred while creating test data"
      });
      console.error("Test data generation error:", error);
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            Business Insights
          </CardTitle>
          <Badge className="bg-fixlyfy-success">AI Powered</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button 
              onClick={testOpenAI}
              variant="outline" 
              size="sm"
            >
              Test OpenAI Connection
            </Button>
            
            <Button
              onClick={handleGenerateTestData}
              variant="outline"
              size="sm"
              disabled={isGeneratingData}
              className="flex items-center gap-1"
            >
              <Database size={14} className="mr-1" />
              {isGeneratingData ? "Generating..." : "Generate Test Data"}
            </Button>
          </div>
          
          {insights && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInsights(null)}
              className="text-fixlyfy-text-secondary"
            >
              <RefreshCw size={14} className="mr-1" />
              Reset Insights
            </Button>
          )}
        </div>
        
        <InsightsGenerator 
          data={businessMetrics} 
          topic="monthly business performance"
          onInsightsGenerated={setInsights}
          systemContext="You are an expert business analyst for a field service company called Fixlyfy. Analyze the metrics and provide 3-5 specific actionable insights to improve performance. Format your response with bullet points using the '•' symbol."
        />
      </CardContent>
    </Card>
  );
};
