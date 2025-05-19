
import { useState } from "react";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Business Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Button 
            onClick={testOpenAI}
            variant="outline" 
            size="sm"
            className="mb-4"
          >
            Test OpenAI Connection
          </Button>
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
