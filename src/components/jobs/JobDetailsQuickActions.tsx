
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, FileText, Bell, UserPlus, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
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

const aiSuggestions = [
  {
    id: 1,
    tip: "This is a returning customer with 5+ jobs. Consider offering a loyalty discount.",
    type: "info"
  },
  {
    id: 2,
    tip: "The HVAC unit is 8 years old. Suggest a maintenance plan for better performance.",
    type: "recommendation"
  },
  {
    id: 3,
    tip: "Similar jobs typically require these additional parts: air filter, capacitor.",
    type: "insight"
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
  const [openSuggestions, setOpenSuggestions] = useState<number[]>([0, 1, 2]);
  const [isCompleteJobDialogOpen, setIsCompleteJobDialogOpen] = useState(false);
  
  const handleFeedback = (id: number, isPositive: boolean) => {
    console.log(`Feedback for suggestion ${id}: ${isPositive ? 'positive' : 'negative'}`);
    toast.success(`Feedback recorded for suggestion #${id}`);
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
  
  return (
    <>
      {/* AI Suggestions Panel */}
      <Card className="border-fixlyfy-border bg-fixlyfy/5 mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-fixlyfy-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-medium">AI Suggestions</h3>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          {aiSuggestions.map((suggestion, idx) => (
            <div 
              key={suggestion.id} 
              className={cn(
                "p-4 rounded-lg border animate-fade-in",
                suggestion.type === 'info' && "border-fixlyfy-info/20 bg-fixlyfy-info/5",
                suggestion.type === 'recommendation' && "border-fixlyfy/20 bg-fixlyfy/5",
                suggestion.type === 'insight' && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5",
              )}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <p className="text-sm text-fixlyfy-text-secondary">{suggestion.tip}</p>
              <div className="flex gap-2 mt-2">
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
            </div>
          ))}
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
