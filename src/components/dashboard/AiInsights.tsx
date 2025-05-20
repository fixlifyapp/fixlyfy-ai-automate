
import { cn } from "@/lib/utils";
import { Brain, AlertTriangle, TrendingUp, Clock, Star, ArrowUpRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { clients } from "@/data/real-clients";
import { jobs } from "@/data/real-jobs";

export const AiInsights = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [businessData, setBusinessData] = useState<any>(null);

  useEffect(() => {
    // Generate real insights based on client and job data
    const activeClients = clients.filter(client => client.status === "active");
    const completedJobs = jobs.filter(job => job.status === "completed");
    
    // Calculate HVAC revenue
    const hvacJobs = jobs.filter(job => 
      job.tags.includes("HVAC") && job.status === "completed"
    );
    const hvacRevenue = hvacJobs.reduce((sum, job) => sum + job.revenue, 0);
    const totalRevenue = completedJobs.reduce((sum, job) => sum + job.revenue, 0);
    
    // Calculate technician utilization
    const technicians = [...new Set(jobs.map(job => job.technician.name))];
    const technicianData = technicians.reduce((acc: Record<string, any>, name) => {
      const techJobs = jobs.filter(job => job.technician.name === name);
      acc[name] = techJobs.length;
      return acc;
    }, {});
    
    // Find underutilized technicians
    const avgJobsPerTech = jobs.length / technicians.length;
    const underutilizedTechs = Object.entries(technicianData)
      .filter(([_, count]) => (count as number) < avgJobsPerTech * 0.7)
      .map(([name]) => name);
    
    // Generate insights based on real data
    const generatedInsights = [
      {
        id: 1,
        title: 'Revenue Opportunity',
        description: `HVAC revenue is ${(hvacRevenue / totalRevenue * 100).toFixed(0)}% of total revenue. Consider expanding this service line.`,
        type: 'warning',
        action: 'Create Promotion',
        actionUrl: '/marketing',
        icon: AlertTriangle
      },
      {
        id: 2,
        title: 'Scheduling Optimization',
        description: `${underutilizedTechs.length} technicians are underutilized. Optimize your schedule to balance workloads.`,
        type: 'info',
        action: 'Optimize Schedule',
        actionUrl: '/schedule',
        icon: Clock
      },
      {
        id: 3,
        title: 'Customer Satisfaction',
        description: `Average client rating is ${(activeClients.reduce((sum, client) => sum + client.rating, 0) / activeClients.length).toFixed(1)}/5. Great job!`,
        type: 'success',
        action: 'View Details',
        actionUrl: '/reports',
        icon: Star
      },
      {
        id: 4,
        title: 'Performance Trend',
        description: `Your business has ${completedJobs.length} completed jobs this period with average value of $${(totalRevenue / completedJobs.length).toFixed(0)}.`,
        type: 'info',
        action: 'View Analytics',
        actionUrl: '/reports',
        icon: TrendingUp
      }
    ];
    
    setInsights(generatedInsights);
    
    // Set business data for AI recommendations
    const data = {
      revenue: {
        current: totalRevenue,
        previous: totalRevenue * 0.85, // Simulated previous revenue
        trend: 15.7
      },
      services: {
        hvac: { 
          completed: hvacJobs.length, 
          revenue: hvacRevenue 
        },
        plumbing: { 
          completed: jobs.filter(j => j.tags.includes("Plumbing") && j.status === "completed").length, 
          revenue: jobs.filter(j => j.tags.includes("Plumbing") && j.status === "completed")
            .reduce((sum, j) => sum + j.revenue, 0) 
        },
        electrical: { 
          completed: jobs.filter(j => j.tags.includes("Electrical") && j.status === "completed").length, 
          revenue: jobs.filter(j => j.tags.includes("Electrical") && j.status === "completed")
            .reduce((sum, j) => sum + j.revenue, 0)
        }
      },
      technicians: {
        total: technicians.length,
        utilization: 78,
        topPerforming: Object.entries(technicianData)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 2)
          .map(([name]) => name)
      }
    };
    
    setBusinessData(data);
  }, []);
  
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call for demonstration
      setTimeout(() => {
        toast.success("Report generated successfully!", {
          description: "Your AI summary report is ready to view",
          action: {
            label: "View",
            onClick: () => console.log("View report clicked")
          }
        });
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      toast.error("Failed to generate report", {
        description: "Please try again later"
      });
      console.error("Error generating report:", error);
      setIsGenerating(false);
    }
  };
  
  if (!businessData || insights.length === 0) {
    return <div className="fixlyfy-card h-full p-6">Loading insights...</div>;
  }
  
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
        
        <div className="mt-6 p-4 border border-fixlyfy-border rounded-lg">
          <div className="flex items-center mb-3">
            <Lightbulb className="w-5 h-5 text-fixlyfy mr-2" />
            <h3 className="text-sm font-medium">AI Recommendation</h3>
          </div>
          <InsightsGenerator
            data={businessData}
            topic="business growth opportunities"
            onInsightsGenerated={setRecommendation}
            mode="recommendations"
            variant="compact"
            systemContext="You are an expert business consultant for a field service company. Provide ONE specific, actionable recommendation to improve business performance based on the data. Keep it under 100 words and very specific."
          />
        </div>
      </div>
      
      <div className="p-4 mx-6 mb-6 rounded-lg bg-gradient-primary">
        <div className="flex items-center mb-2">
          <Brain size={16} className="text-white mr-2" />
          <h3 className="text-sm font-medium text-white">AI Summary Report</h3>
        </div>
        <p className="text-xs text-white/80 mb-3">
          Get an AI-generated report summarizing your business performance for the week.
        </p>
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full"
          onClick={generateReport}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </div>
  );
};
