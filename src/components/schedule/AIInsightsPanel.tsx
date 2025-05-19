
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
  CheckCircle,
  Brain
} from "lucide-react";
import { toast } from "sonner";

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

// Sample schedule data for AI analysis
const scheduleData = {
  technicians: [
    { id: 1, name: "Robert Smith", jobs: 5, utilization: 90, skills: ["hvac", "plumbing"] },
    { id: 2, name: "Mia Johnson", jobs: 2, utilization: 45, skills: ["electrical", "security"] },
    { id: 3, name: "James Davis", jobs: 4, utilization: 75, skills: ["hvac", "electrical"] }
  ],
  jobs: [
    { id: "1223", client: "Thompson", location: "Downtown", time: "2:00 PM", duration: 90, tech: 1 },
    { id: "1244", client: "Garcia", location: "North End", time: "9:00 AM", duration: 60, tech: 3 },
    { id: "1251", client: "Miller", location: "West Side", time: "11:30 AM", duration: 120, tech: 2 },
    { id: "1255", client: "Wilson", location: "West Side", time: "3:00 PM", duration: 90, tech: 1 },
    { id: "1262", client: "Johnson", location: "East End", time: "1:00 PM", duration: 120, unassigned: true }
  ],
  metrics: {
    utilization: 70,
    travelEfficiency: 65
  }
};

export const AIInsightsPanel = () => {
  const [insights, setInsights] = useState(initialInsights);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  
  const { generateText, generateRecommendations, isLoading } = useAI({
    systemContext: "You are an AI assistant that provides insights for field service scheduling optimization. Focus on practical, specific suggestions that can improve the schedule."
  });
  
  const handleAction = (id: number) => {
    // In a real app, this would apply the suggested change
    setInsights(prev => prev.filter(insight => insight.id !== id));
    toast.success("Schedule change applied");
  };
  
  const handleFeedback = (id: number, isPositive: boolean) => {
    // In a real app, this would send feedback to improve the AI
    setInsights(prev => prev.filter(insight => insight.id !== id));
    toast.success(`Thank you for your ${isPositive ? "positive" : "negative"} feedback`);
  };
  
  const generateMoreInsights = async () => {
    setIsGenerating(true);
    toast.loading("Analyzing schedule data...");
    
    try {
      const suggestionText = await generateRecommendations(
        scheduleData,
        "schedule optimization"
      );
      
      if (suggestionText) {
        setAiRecommendation(suggestionText);
        
        // Create a new insight based on AI generation
        const newInsight = {
          id: Date.now(),
          type: ["conflict", "route", "utilization", "travel"][Math.floor(Math.random() * 4)],
          title: "AI Schedule Recommendation",
          description: suggestionText.split('\n')[0].replace('• ', ''),
          icon: Brain,
          iconColor: "text-fixlyfy",
          action: "Optimize"
        };
        
        setInsights(prev => [newInsight, ...prev]);
        toast.dismiss();
        toast.success("New schedule insight generated");
      }
    } catch (error) {
      console.error("Failed to generate insights:", error);
      toast.dismiss();
      toast.error("Failed to generate schedule insights");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="fixlyfy-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-fixlyfy-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold">AI Schedule Insights</h2>
        </div>
        <Badge className="bg-fixlyfy/20 text-fixlyfy hover:bg-fixlyfy/30">GPT-4o</Badge>
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
      
      <div className="p-4 border-t border-fixlyfy-border">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full mb-4" 
          onClick={generateMoreInsights}
          disabled={isGenerating || isLoading}
        >
          {(isGenerating || isLoading) ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Schedule...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate New Insights
            </>
          )}
        </Button>
      
        <div className="bg-fixlyfy-bg-interface/30 p-4 rounded-lg">
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
    </div>
  );
};
