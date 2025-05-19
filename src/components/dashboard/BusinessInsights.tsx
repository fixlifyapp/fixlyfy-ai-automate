
import { useState } from "react";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Business Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
