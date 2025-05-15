
import { cn } from "@/lib/utils";
import { Brain, AlertTriangle, TrendingUp, Clock, Star, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const insights = [
  {
    id: 1,
    title: 'Revenue Opportunity',
    description: 'HVAC revenue is down 18% compared to last month. Consider a targeted promotion.',
    type: 'warning',
    action: 'Create Promotion',
    actionUrl: '/marketing',
    icon: AlertTriangle
  },
  {
    id: 2,
    title: 'Scheduling Optimization',
    description: '3 technicians are underutilized next week. Optimize your schedule.',
    type: 'info',
    action: 'Optimize Schedule',
    actionUrl: '/schedule',
    icon: Clock
  },
  {
    id: 3,
    title: 'Customer Satisfaction',
    description: 'Customer ratings improved by 12% this month. Great job!',
    type: 'success',
    action: 'View Details',
    actionUrl: '/reports',
    icon: Star
  },
  {
    id: 4,
    title: 'Performance Trend',
    description: 'Your business efficiency has increased 8% over the last quarter.',
    type: 'info',
    action: 'View Analytics',
    actionUrl: '/reports',
    icon: TrendingUp
  }
];

export const AiInsights = () => {
  return (
    <div className="fixlyfy-card h-full">
      <div className="p-6 border-b border-fixlyfy-border flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md mr-3 fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-medium">AI Insights</h2>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-4 overflow-auto max-h-[calc(100%-200px)]">
        {insights.map((insight, idx) => (
          <div 
            key={insight.id} 
            className={cn(
              "p-4 rounded-lg border animate-fade-in",
              insight.type === 'success' && "border-fixlyfy-success/20 bg-fixlyfy-success/5",
              insight.type === 'warning' && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5",
              insight.type === 'info' && "border-fixlyfy-info/20 bg-fixlyfy-info/5",
            )}
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-2 items-center">
                <insight.icon className={cn(
                  "h-4 w-4",
                  insight.type === 'success' && "text-fixlyfy-success",
                  insight.type === 'warning' && "text-fixlyfy-warning",
                  insight.type === 'info' && "text-fixlyfy-info",
                )} />
                <h3 className={cn(
                  "text-sm font-medium",
                  insight.type === 'success' && "text-fixlyfy-success",
                  insight.type === 'warning' && "text-fixlyfy-warning",
                  insight.type === 'info' && "text-fixlyfy-info",
                )}>
                  {insight.title}
                </h3>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                insight.type === 'success' && "bg-fixlyfy-success",
                insight.type === 'warning' && "bg-fixlyfy-warning",
                insight.type === 'info' && "bg-fixlyfy-info",
              )} />
            </div>
            <p className="text-sm text-fixlyfy-text-secondary mb-2 mt-1">{insight.description}</p>
            {insight.action && (
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "w-full text-fixlyfy border-fixlyfy/20 justify-between",
                  insight.type === 'success' && "text-fixlyfy-success border-fixlyfy-success/20",
                  insight.type === 'warning' && "text-fixlyfy-warning border-fixlyfy-warning/20",
                  insight.type === 'info' && "text-fixlyfy-info border-fixlyfy-info/20",
                )}
                asChild
              >
                <a href={insight.actionUrl}>
                  {insight.action}
                  <ArrowUpRight size={14} />
                </a>
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 mx-6 mb-6 rounded-lg bg-gradient-primary">
        <div className="flex items-center mb-2">
          <Brain size={16} className="text-white mr-2" />
          <h3 className="text-sm font-medium text-white">AI Summary Report</h3>
        </div>
        <p className="text-xs text-white/80 mb-3">
          Get an AI-generated report summarizing your business performance for the week.
        </p>
        <Button variant="secondary" size="sm" className="w-full">
          Generate Report
        </Button>
      </div>
    </div>
  );
};
