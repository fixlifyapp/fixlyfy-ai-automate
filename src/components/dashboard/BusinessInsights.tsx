
import { useState, useEffect } from "react";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, RefreshCw, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const BusinessInsights = () => {
  const [insights, setInsights] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessMetrics, setBusinessMetrics] = useState<any>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    async function fetchBusinessMetrics() {
      try {
        // Fetch clients data
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*');
          
        if (clientsError) throw clientsError;
        
        // Updated query to avoid join issues with technician_id
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*');
          
        if (jobsError) throw jobsError;
        
        // Fetch profiles separately
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name');
          
        // Create a map of technician IDs to names
        const technicianMap = new Map();
        if (profiles) {
          profiles.forEach((profile: any) => {
            technicianMap.set(profile.id, profile.name);
          });
        }
        
        // Calculate metrics based on the real data
        const completedJobs = jobs.filter(job => job.status === "completed");
        const activeClients = clients.filter(client => client.status === "active");
        
        const currentRevenue = completedJobs.reduce((total, job) => total + parseFloat(job.revenue?.toString() || '0'), 0);
        // Calculate previous revenue (simulate as 85% of current for demo)
        const previousRevenue = currentRevenue * 0.85;
        const revenueTrend = currentRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        
        // Count jobs by status
        const jobsByStatus = {
          completed: jobs.filter(job => job.status === "completed").length,
          scheduled: jobs.filter(job => job.status === "scheduled").length,
          inProgress: jobs.filter(job => job.status === "in-progress").length,
          canceled: jobs.filter(job => job.status === "canceled").length
        };
        
        // Technician performance
        const technicianPerformance: Record<string, any> = {};
        
        jobs.forEach(job => {
          const techName = job.technician_id ? 
            technicianMap.get(job.technician_id) || 'Unassigned' : 
            'Unassigned';
            
          if (!technicianPerformance[techName]) {
            technicianPerformance[techName] = { jobs: 0, revenue: 0 };
          }
          technicianPerformance[techName].jobs += 1;
          
          if (job.status === "completed") {
            technicianPerformance[techName].revenue += parseFloat(job.revenue?.toString() || '0');
          }
        });
        
        // Find top performer
        let topPerformer = "None";
        let maxJobs = 0;
        
        Object.entries(technicianPerformance).forEach(([name, data]: [string, any]) => {
          if (data.jobs > maxJobs) {
            maxJobs = data.jobs;
            topPerformer = name;
          }
        });
        
        // Calculate customer metrics
        const metrics = {
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            trend: revenueTrend.toFixed(1)
          },
          jobs: jobsByStatus,
          customers: {
            new: Math.floor(activeClients.length * 0.2), // Simulate 20% new clients
            returning: Math.floor(activeClients.length * 0.8), // Simulate 80% returning clients
            satisfaction: 4.7 // Hardcoded for demo
          },
          technicians: {
            utilization: 78, // Hardcoded for demo
            efficiency: 82, // Hardcoded for demo
            topPerformer: topPerformer
          }
        };
        
        setBusinessMetrics(metrics);
      } catch (error) {
        console.error("Error fetching business metrics:", error);
        toast.error("Failed to load business insights data");
      }
    }
    
    fetchBusinessMetrics();
  }, [user]);
  
  const testOpenAI = async () => {
    try {
      setTestStatus("loading");
      
      // Fix the authentication method - use access token differently
      const { data: { session } } = await supabase.auth.getSession();
      
      // Test the OpenAI connection via edge function
      const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/test-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('OpenAI connection failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTestStatus("success");
        toast.success("OpenAI connection successful!", {
          description: "Your AI insights feature is ready to use"
        });
      } else {
        throw new Error(result.error || 'OpenAI connection failed');
      }
    } catch (error) {
      setTestStatus("error");
      toast.error("OpenAI connection failed", {
        description: "Please check your API key and try again"
      });
      console.error("OpenAI test error:", error);
    }
  };
  
  if (!businessMetrics) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-fixlyfy rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <span className="ml-2">Loading metrics...</span>
        </CardContent>
      </Card>
    );
  }
  
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
          <Button 
            onClick={testOpenAI}
            variant="outline" 
            size="sm"
            disabled={testStatus === "loading"}
          >
            {testStatus === "loading" && (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent text-fixlyfy rounded-full" />
            )}
            Test OpenAI Connection
          </Button>
          
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
