
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, FileText, Bell, UserPlus, ThumbsUp, ThumbsDown, Clock, DollarSign, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAI } from "@/hooks/use-ai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AiSuggestion {
  id: number;
  tip: string;
  type: "info" | "recommendation" | "insight" | "warning" | "upsell";
  category?: "revenue" | "efficiency" | "customer" | "sales";
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Initial AI suggestions categorized by type
const initialAiSuggestions: AiSuggestion[] = [
  {
    id: 1,
    tip: "This is a returning customer with 5+ jobs. Consider offering a loyalty discount.",
    type: "info",
    category: "customer",
    action: {
      label: "Create Discount",
      onClick: () => toast.success("Loyalty discount created")
    }
  },
  {
    id: 2,
    tip: "The appliance is 8 years old. Suggest a maintenance plan for better performance.",
    type: "recommendation",
    category: "upsell",
    action: {
      label: "Add to Estimate",
      onClick: () => toast.success("Maintenance plan added to estimate")
    }
  },
  {
    id: 3,
    tip: "Similar jobs typically require these additional parts: air filter, capacitor.",
    type: "insight",
    category: "efficiency",
    action: {
      label: "Order Parts",
      onClick: () => toast.success("Parts ordered")
    }
  },
  {
    id: 4,
    tip: "Estimates-to-invoice conversion for this client type is only 42% — consider adjusting your pricing approach.",
    type: "warning",
    category: "sales",
    action: {
      label: "View Conversion Insights",
      onClick: () => toast.success("Viewing detailed conversion insights")
    }
  },
  {
    id: 5,
    tip: "Adding a 1-Year Warranty increases estimate acceptance by 94% for this job type.",
    type: "upsell",
    category: "sales",
    action: {
      label: "Include Warranty",
      onClick: () => toast.success("1-Year Warranty included in estimate")
    }
  }
];

const quickActions = [
  {
    id: 1,
    name: "Complete Job",
    variant: "default",
    className: "bg-fixlyfy hover:bg-fixlyfy/90 w-full",
    icon: CheckCircle
  },
  {
    id: 2,
    name: "Send Reminder",
    variant: "outline",
    className: "w-full",
    icon: Bell
  }
];

export const JobDetailsQuickActions = () => {
  const { id } = useParams();
  const [openSuggestions, setOpenSuggestions] = useState<number[]>([0, 1, 2, 3, 4]);
  const [isCompleteJobDialogOpen, setIsCompleteJobDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(initialAiSuggestions);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { generateText } = useAI({
    systemContext: "You are an AI assistant for a field service business. Generate concise, practical insights for technicians and managers about service jobs."
  });
  
  const handleFeedback = (id: number, isPositive: boolean) => {
    console.log(`Feedback for suggestion ${id}: ${isPositive ? 'positive' : 'negative'}`);
    
    // Remove the suggestion if feedback is negative
    if (!isPositive) {
      setAiSuggestions(aiSuggestions.filter(suggestion => suggestion.id !== id));
      toast.success("Thanks for your feedback! We'll improve our suggestions.");
    } else {
      toast.success("Thanks for your feedback! Glad this was helpful.");
    }
  };

  const handleQuickAction = (actionId: number) => {
    switch (actionId) {
      case 1: // Complete Job
        setIsCompleteJobDialogOpen(true);
        break;
      case 2: // Send Reminder
        toast.success("Reminder sent to client");
        break;
      default:
        break;
    }
  };

  const handleCompleteJob = () => {
    toast.success("Job marked as completed");
    setIsCompleteJobDialogOpen(false);
  };
  
  const generateNewSuggestion = async () => {
    if (isGeneratingSuggestion) return;
    
    setIsGeneratingSuggestion(true);
    
    try {
      const categories = ["revenue", "efficiency", "customer", "sales"];
      const suggestionTypes = ["info", "recommendation", "insight", "warning", "upsell"];
      
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const selectedCategory = categories[categoryIndex] as "revenue" | "efficiency" | "customer" | "sales";
      
      const typeIndex = Math.floor(Math.random() * suggestionTypes.length);
      const selectedType = suggestionTypes[typeIndex] as "info" | "recommendation" | "insight" | "warning" | "upsell";
      
      let promptTemplate = `Generate a practical business insight for a field service technician about job ID ${id}.`;
      
      // Customize prompt based on category
      switch (selectedCategory) {
        case "revenue":
          promptTemplate += " Focus on revenue optimization, pricing, or upselling opportunities.";
          break;
        case "efficiency":
          promptTemplate += " Focus on job efficiency, time management, or resource optimization.";
          break;
        case "customer":
          promptTemplate += " Focus on customer satisfaction, retention, or relationship management.";
          break;
        case "sales":
          promptTemplate += " Focus on sales techniques, estimate conversion, or add-on services.";
          break;
      }
      
      promptTemplate += " Make it practical, specific, and under 100 characters. Return just the text of the suggestion.";
      
      const newSuggestionText = await generateText(promptTemplate);
      
      if (newSuggestionText) {
        const actionLabel = selectedType === "warning" ? "View Details" : 
                           selectedType === "upsell" ? "Add to Estimate" :
                           selectedType === "recommendation" ? "Apply Now" : "Learn More";
        
        const newSuggestion: AiSuggestion = {
          id: Date.now(),
          tip: newSuggestionText,
          type: selectedType,
          category: selectedCategory,
          action: {
            label: actionLabel,
            onClick: () => toast.success(`Action taken on: ${newSuggestionText}`)
          }
        };
        
        setAiSuggestions([...aiSuggestions, newSuggestion]);
        setOpenSuggestions([...openSuggestions, aiSuggestions.length]);
      }
    } catch (error) {
      console.error("Error generating suggestion:", error);
      toast.error("Failed to generate new insight. Please try again.");
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const filterByCategory = (category: string | null) => {
    setActiveCategory(category);
  };
  
  const filteredSuggestions = activeCategory 
    ? aiSuggestions.filter(s => s.category === activeCategory) 
    : aiSuggestions;
  
  const getCategoryIcon = (category: string | undefined) => {
    switch (category) {
      case "revenue": return <DollarSign size={14} />;
      case "efficiency": return <Clock size={14} />;
      case "customer": return <UserPlus size={14} />;
      case "sales": return <Zap size={14} />;
      default: return <Brain size={14} />;
    }
  };
  
  return (
    <>
      {/* AI Suggestions Panel */}
      <Card className="border-fixlyfy-border bg-fixlyfy/5 mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-fixlyfy-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-medium">AI Insights</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-x-auto pb-1 -mr-1 space-x-1 scrollbar-hide">
              {["revenue", "efficiency", "customer", "sales"].map((category) => (
                <Button 
                  key={category} 
                  size="sm" 
                  variant={activeCategory === category ? "default" : "outline"}
                  className={cn(
                    "text-xs px-2 py-1 h-7",
                    activeCategory === category && "bg-fixlyfy text-white"
                  )}
                  onClick={() => filterByCategory(activeCategory === category ? null : category)}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1 capitalize">{category}</span>
                </Button>
              ))}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={generateNewSuggestion}
              disabled={isGeneratingSuggestion}
            >
              {isGeneratingSuggestion ? "Thinking..." : "Generate Insight"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, idx) => (
              <div 
                key={suggestion.id} 
                className={cn(
                  "p-4 rounded-lg border animate-fade-in",
                  suggestion.type === 'info' && "border-fixlyfy-info/20 bg-fixlyfy-info/5",
                  suggestion.type === 'recommendation' && "border-fixlyfy/20 bg-fixlyfy/5",
                  suggestion.type === 'insight' && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5",
                  suggestion.type === 'warning' && "border-red-400/20 bg-red-400/5",
                  suggestion.type === 'upsell' && "border-green-400/20 bg-green-400/5",
                )}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 p-1.5 rounded-md",
                    suggestion.type === 'info' && "bg-fixlyfy-info/20",
                    suggestion.type === 'recommendation' && "bg-fixlyfy/20",
                    suggestion.type === 'insight' && "bg-fixlyfy-warning/20",
                    suggestion.type === 'warning' && "bg-red-400/20",
                    suggestion.type === 'upsell' && "bg-green-400/20",
                  )}>
                    {suggestion.category ? (
                      getCategoryIcon(suggestion.category)
                    ) : (
                      <Brain size={14} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-fixlyfy-text-secondary">{suggestion.tip}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleFeedback(suggestion.id, true)}
                        >
                          <ThumbsUp size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleFeedback(suggestion.id, false)}
                        >
                          <ThumbsDown size={14} />
                        </Button>
                      </div>
                      {suggestion.action && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-6 text-xs font-medium"
                          onClick={suggestion.action.onClick}
                        >
                          {suggestion.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-fixlyfy-text-secondary">
              <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-fixlyfy-warning/50" />
              <p>No insights match the selected filter.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setActiveCategory(null)}
              >
                Clear Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions Block */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader className="p-4 border-b border-fixlyfy-border">
          <h3 className="text-lg font-medium">Quick Actions</h3>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          {quickActions.map((action) => (
            <Button 
              key={action.id} 
              variant={action.variant as any} 
              className={cn(action.className, "flex items-center gap-2")}
              onClick={() => handleQuickAction(action.id)}
            >
              <action.icon size={18} />
              {action.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Complete Job Dialog */}
      <AlertDialog 
        open={isCompleteJobDialogOpen} 
        onOpenChange={setIsCompleteJobDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the job as completed and notify the client. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteJob}>Yes, Complete Job</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
