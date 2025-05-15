
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

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
    className: "bg-fixlyfy hover:bg-fixlyfy/90 w-full"
  },
  {
    id: 2,
    name: "Create Invoice",
    variant: "outline",
    className: "w-full"
  },
  {
    id: 3,
    name: "Send Reminder",
    variant: "outline",
    className: "w-full"
  },
  {
    id: 4,
    name: "Reassign",
    variant: "outline",
    className: "w-full"
  }
];

export const JobDetailsQuickActions = () => {
  return (
    <div className="space-y-6">
      <div className="fixlyfy-card">
        <div className="p-6 border-b border-fixlyfy-border flex items-center">
          <div className="w-8 h-8 rounded-md mr-3 fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-medium">AI Suggestions</h3>
        </div>
        
        <div className="p-6 space-y-4">
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
            </div>
          ))}
        </div>
      </div>
      
      <div className="fixlyfy-card">
        <div className="p-6 border-b border-fixlyfy-border">
          <h3 className="text-lg font-medium">Quick Actions</h3>
        </div>
        
        <div className="p-6 space-y-3">
          {quickActions.map((action) => (
            <Button 
              key={action.id} 
              variant={action.variant as any} 
              className={action.className}
            >
              {action.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
