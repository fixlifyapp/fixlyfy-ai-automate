
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Star, TrendingUp, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { forceRefreshAIInsights } from "@/utils/ai-refresh";

interface InsightItem {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  action?: string;
  actionUrl?: string;
  icon: React.ElementType;
}

export const AiInsightsPanel = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fetchInsights = async (forceRefresh = false) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
        forceRefreshAIInsights(); // Clear the refresh timestamp to force a refresh
      }
      
      // Fetch real data from Supabase
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*');
        
      if (jobsError) throw jobsError;
      
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');
        
      if (clientsError) throw clientsError;
      
      // Generate insights based on real data
      const completedJobs = jobs?.filter(job => job.status === "completed") || [];
      const scheduledJobs = jobs?.filter(job => job.status === "scheduled") || [];
      const inProgressJobs = jobs?.filter(job => job.status === "in-progress" || job.status === "in_progress") || [];
      const activeClients = clients?.filter(client => client.status === "active") || [];
      
      // Calculate total revenue from completed jobs
      const totalRevenue = completedJobs.reduce((sum, job) => {
        const revenue = typeof job.revenue === 'number' ? job.revenue : parseFloat(job.revenue || '0');
        return sum + revenue;
      }, 0);
      
      // Group jobs by service type
      const serviceTypes: Record<string, number> = {};
      jobs?.forEach(job => {
        if (job.tags && job.tags.length > 0) {
          const serviceType = Array.isArray(job.tags) ? job.tags[0] : job.tags;
          if (!serviceTypes[serviceType]) {
            serviceTypes[serviceType] = 0;
          }
          serviceTypes[serviceType]++;
        }
      });
      
      // Find most common service type
      let topService = { name: "None", count: 0 };
      Object.entries(serviceTypes).forEach(([name, count]) => {
        if (count > topService.count) {
          topService = { name, count };
        }
      });
      
      // Group jobs by technician for technician performance
      const technicianPerformance: Record<string, { completed: number, total: number }> = {};
      jobs?.forEach(job => {
        if (job.technician_id) {
          if (!technicianPerformance[job.technician_id]) {
            technicianPerformance[job.technician_id] = { completed: 0, total: 0 };
          }
          technicianPerformance[job.technician_id].total++;
          if (job.status === "completed") {
            technicianPerformance[job.technician_id].completed++;
          }
        }
      });
      
      // Find top technician
      let topTechnician = { id: "None", completionRate: 0 };
      Object.entries(technicianPerformance).forEach(([id, stats]) => {
        const completionRate = stats.total > 0 ? stats.completed / stats.total : 0;
        if (completionRate > topTechnician.completionRate && stats.total >= 3) {
          topTechnician = { id, completionRate };
        }
      });
      
      // Calculate workload distribution
      const underutilizedTechs = Object.entries(technicianPerformance)
        .filter(([_, stats]) => stats.total < 3 && inProgressJobs.length + scheduledJobs.length > 5)
        .length;
      
      // Generate data-driven insights
      const generatedInsights: InsightItem[] = [
        {
          id: 1,
          title: 'Revenue Opportunity',
          description: topService.name !== "None" 
            ? `${topService.name} makes up ${Math.round((topService.count / (jobs?.length || 1)) * 100)}% of your service volume. Consider expanding this service line.`
            : 'No service data available. Start categorizing your jobs with tags to get insights.',
          type: 'warning',
          action: 'View Jobs',
          actionUrl: '/jobs',
          icon: AlertTriangle
        },
        {
          id: 2,
          title: 'Scheduling Optimization',
          description: underutilizedTechs > 0
            ? `${underutilizedTechs} technicians appear underutilized. Optimize your schedule to balance workloads.`
            : 'Your technician workload appears well-balanced. Great job managing your team!',
          type: 'info',
          action: 'Optimize Schedule',
          actionUrl: '/schedule',
          icon: Clock
        },
        {
          id: 3,
          title: 'Client Insights',
          description: activeClients.length > 0
            ? `You have ${activeClients.length} active clients with an average of ${(jobs?.length / Math.max(1, activeClients.length)).toFixed(1)} jobs per client.`
            : 'Start adding and managing your clients to get client insights.',
          type: 'success',
          action: 'View Clients',
          actionUrl: '/clients',
          icon: Star
        },
        {
          id: 4,
          title: 'Performance Metrics',
          description: completedJobs.length > 0
            ? `Your business has ${completedJobs.length} completed jobs with average value of $${(totalRevenue / Math.max(1, completedJobs.length)).toFixed(0)}.`
            : 'No completed jobs yet. Focus on moving jobs to completion to start tracking performance.',
          type: 'info',
          action: 'View Reports',
          actionUrl: '/reports',
          icon: TrendingUp
        }
      ];
      
      setInsights(generatedInsights);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error("Error fetching insights data:", error);
      toast.error("Failed to load AI insights", {
        description: "Could not connect to the database. Using sample data instead."
      });
      
      // Fallback to sample insights if there's an error
      const fallbackInsights: InsightItem[] = [
        {
          id: 1,
          title: 'Connection Error',
          description: 'Could not connect to the database. Using sample insights instead.',
          type: 'warning',
          icon: AlertTriangle
        },
        {
          id: 2,
          title: 'Sample: Scheduling',
          description: 'Sample insight: 3 technicians are underutilized. Optimize your schedule to balance workloads.',
          type: 'info',
          action: 'Optimize Schedule',
          actionUrl: '/schedule',
          icon: Clock
        },
        {
          id: 3,
          title: 'Sample: Satisfaction',
          description: 'Sample insight: Average client satisfaction is 4.2/5 based on recent surveys.',
          type: 'success',
          action: 'View Details',
          actionUrl: '/reports',
          icon: Star
        },
        {
          id: 4,
          title: 'Sample: Performance',
          description: 'Sample insight: Your business has 12 completed jobs this period with average value of $450.',
          type: 'info',
          action: 'View Analytics',
          actionUrl: '/reports',
          icon: TrendingUp
        }
      ];
      
      setInsights(fallbackInsights);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchInsights();
  }, [user]);
  
  const getBackgroundColor = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-fixlyfy-success/10';
      case 'warning':
        return 'bg-fixlyfy-warning/10';
      case 'info':
        return 'bg-fixlyfy-info/10';
      default:
        return 'bg-fixlyfy/10';
    }
  };
  
  const getIconColor = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'text-fixlyfy-success';
      case 'warning':
        return 'text-fixlyfy-warning';
      case 'info':
        return 'text-fixlyfy-info';
      default:
        return 'text-fixlyfy';
    }
  };
  
  const handleAction = (url?: string) => {
    if (url) {
      navigate(url);
    } else {
      toast.info('This feature is coming soon!');
    }
  };
  
  const handleRefresh = () => {
    fetchInsights(true);
    toast.success("Refreshing AI insights", {
      description: "Fetching the latest data from your business"
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">AI Business Insights</h2>
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-xs text-fixlyfy-text-secondary">
              Last updated: {new Date(lastRefreshed).toLocaleDateString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4 h-48">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-gray-200 rounded mr-2"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-28 bg-gray-200 rounded mt-auto"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          insights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`${getBackgroundColor(insight.type)} border border-${getIconColor(insight.type).replace('text', 'border')}/30`}
            >
              <CardContent className="p-4 flex flex-col h-48">
                <div className="flex items-center mb-3">
                  <div className={`p-1.5 rounded mr-2 ${getIconColor(insight.type)}`}>
                    <insight.icon size={18} />
                  </div>
                  <h3 className="font-medium">{insight.title}</h3>
                </div>
                <p className="text-sm text-fixlyfy-text-secondary mb-4 flex-grow">
                  {insight.description}
                </p>
                {insight.action && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto"
                    onClick={() => handleAction(insight.actionUrl)}
                  >
                    {insight.action}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
