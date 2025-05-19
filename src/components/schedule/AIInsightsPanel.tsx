
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAI } from "@/hooks/use-ai";
import {
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Route,
  Clock,
  Map,
  UserCheck,
  CheckCircle
} from "lucide-react";

// Sample AI insights data
const initialInsights = [
  {
    id: 1,
    type: "conflict",
    title: "Schedule Conflict Detected",
    description: "Job #1223 conflicts with job in Brampton at 2PM — 45 min gap needed for travel",
    icon: AlertTriangle,
    iconColor: "text-fixlyfy-danger",
    action: "Reschedule"
  },
  {
    id: 2,
    type: "route",
    title: "Route Optimization",
    description: "You can group Job #1251 with Job #1255 — same area, 2h apart, for the same technician",
    icon: Route,
    iconColor: "text-fixlyfy",
    action: "Apply"
  },
  {
    id: 3,
    type: "utilization",
    title: "Technician Underutilized",
    description: "Technician Mia has only 2 jobs today. Suggest assigning job #1262.",
    icon: UserCheck,
    iconColor: "text-fixlyfy-warning",
    action: "Assign"
  },
  {
    id: 4,
    type: "travel",
    title: "Excess Travel Time",
    description: "Job #1244 is 1h away. Reassign to James to save 40 min travel time.",
    icon: Map,
    iconColor: "text-fixlyfy-success",
    action: "Reassign"
  }
];

export const AIInsightsPanel = () => {
  const [insights, setInsights] = useState(initialInsights);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateText, isLoading } = useAI({
    systemContext: "You are an AI assistant that provides insights for field service scheduling optimization."
  });
  
  const handleAction = (id: number) => {
    // In a real app, this would apply the suggested change
    setInsights(prev => prev.filter(insight => insight.id !== id));
  };
  
  const handleFeedback = (id: number, isPositive: boolean) => {
    // In a real app, this would send feedback to improve the AI
    setInsights(prev => prev.filter(insight => insight.id !== id));
  };
  
  const generateMoreInsights = async () => {
    setIsGenerating(true);
    try {
      const suggestionText = await generateText(
        "Generate a scheduling optimization insight for a field service company with technicians."
      );
      
      if (suggestionText) {
        // Create a new insight based on AI generation
        const newInsight = {
          id: Date.now(),
          type: ["conflict", "route", "utilization", "travel"][Math.floor(Math.random() * 4)],
          title: "New AI Suggestion",
          description: suggestionText,
          icon: Lightbulb,
          iconColor: "text-fixlyfy",
          action: "Consider"
        };
        
        setInsights(prev => [newInsight, ...prev]);
      }
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="fixlyfy-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-fixlyfy-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateMoreInsights}
          disabled={isGenerating || isLoading}
        >
          {(isGenerating || isLoading) ? "Thinking..." : "Refresh Insights"}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {insights.length === 0 ? (
          <div className="p-8 text-center text-fixlyfy-text-secondary">
            <Lightbulb className="mx-auto mb-2 h-10 w-10 opacity-50" />
            <p>No insights available at the moment.</p>
            <p className="text-sm mt-1">Check back later or refresh.</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="p-4 border-b border-fixlyfy-border">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${insight.iconColor}`}>
                  <insight.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-sm">{insight.title}</h3>
                    <Badge 
                      variant={
                        insight.type === "conflict" ? "destructive" : 
                        insight.type === "route" ? "default" :
                        insight.type === "utilization" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-fixlyfy-text-secondary mb-3">{insight.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7"
                        onClick={() => handleAction(insight.id)}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        {insight.action}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleFeedback(insight.id, true)}
                      >
                        <ThumbsUp size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleFeedback(insight.id, false)}
                      >
                        <ThumbsDown size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-fixlyfy-border bg-fixlyfy-bg-interface/30">
        <h3 className="text-sm font-medium mb-2">Schedule Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-fixlyfy-text-secondary mb-1">Technician Utilization</p>
            <div className="w-full bg-fixlyfy-border rounded-full h-2">
              <div className="bg-fixlyfy h-2 rounded-full" style={{ width: "78%" }}></div>
            </div>
            <p className="text-xs mt-1 text-right">78%</p>
          </div>
          <div>
            <p className="text-xs text-fixlyfy-text-secondary mb-1">Travel Efficiency</p>
            <div className="w-full bg-fixlyfy-border rounded-full h-2">
              <div className="bg-fixlyfy-success h-2 rounded-full" style={{ width: "65%" }}></div>
            </div>
            <p className="text-xs mt-1 text-right">65%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
