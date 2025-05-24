
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Star, TrendingUp, RefreshCw, Brain, DollarSign, Users, Target, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { forceRefreshAIInsights } from "@/utils/ai-refresh";

interface InsightItem {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'priority';
  action?: string;
  actionUrl?: string;
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
  impact: string;
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
        forceRefreshAIInsights();
      }
      
      // Fetch comprehensive business data
      const [
        { data: jobs, error: jobsError },
        { data: clients, error: clientsError },
        { data: payments, error: paymentsError },
        { data: invoices, error: invoicesError }
      ] = await Promise.all([
        supabase.from('jobs').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('invoices').select('*')
      ]);
        
      if (jobsError) throw jobsError;
      if (clientsError) throw clientsError;
      if (paymentsError) throw paymentsError;
      if (invoicesError) throw invoicesError;
      
      // Calculate business metrics
      const completedJobs = jobs?.filter(job => job.status === "completed") || [];
      const scheduledJobs = jobs?.filter(job => job.status === "scheduled") || [];
      const inProgressJobs = jobs?.filter(job => job.status === "in-progress" || job.status === "in_progress") || [];
      const activeClients = clients?.filter(client => client.status === "active") || [];
      const unpaidInvoices = invoices?.filter(invoice => invoice.status === "unpaid") || [];
      
      // Calculate total revenue
      const totalRevenue = completedJobs.reduce((sum, job) => {
        const revenue = typeof job.revenue === 'number' ? job.revenue : parseFloat(job.revenue || '0');
        return sum + revenue;
      }, 0);
      
      // Calculate average job value
      const avgJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;
      
      // Calculate outstanding invoices value
      const outstandingAmount = unpaidInvoices.reduce((sum, invoice) => {
        return sum + (typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || '0'));
      }, 0);
      
      // Group jobs by service type for trend analysis
      const serviceTypes: Record<string, { count: number; revenue: number }> = {};
      completedJobs.forEach(job => {
        if (job.tags && job.tags.length > 0) {
          const serviceType = Array.isArray(job.tags) ? job.tags[0] : job.tags;
          if (!serviceTypes[serviceType]) {
            serviceTypes[serviceType] = { count: 0, revenue: 0 };
          }
          serviceTypes[serviceType].count++;
          serviceTypes[serviceType].revenue += typeof job.revenue === 'number' ? job.revenue : parseFloat(job.revenue || '0');
        }
      });
      
      // Find top service type
      let topService = { name: "Service", count: 0, revenue: 0 };
      Object.entries(serviceTypes).forEach(([name, data]) => {
        if (data.count > topService.count) {
          topService = { name, count: data.count, revenue: data.revenue };
        }
      });
      
      // Calculate technician performance
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
      
      // Calculate workload distribution
      const underutilizedTechs = Object.entries(technicianPerformance)
        .filter(([_, stats]) => stats.total < 3 && (inProgressJobs.length + scheduledJobs.length) > 5)
        .length;
      
      // Generate actionable business insights
      const generatedInsights: InsightItem[] = [];
      
      // Revenue optimization insight
      if (outstandingAmount > 0) {
        generatedInsights.push({
          id: 1,
          title: 'Collect Outstanding Payments',
          description: `You have $${outstandingAmount.toLocaleString()} in unpaid invoices. Follow up with clients to improve cash flow by ${Math.round((outstandingAmount / totalRevenue) * 100) || 0}%.`,
          type: 'priority',
          priority: 'high',
          impact: `+$${outstandingAmount.toLocaleString()} potential revenue`,
          action: 'Review Invoices',
          actionUrl: '/finance',
          icon: DollarSign
        });
      }
      
      // Service optimization insight
      if (topService.name !== "Service" && topService.count > 0) {
        const servicePercentage = Math.round((topService.count / completedJobs.length) * 100);
        generatedInsights.push({
          id: 2,
          title: 'Optimize Top Service Line',
          description: `${topService.name} represents ${servicePercentage}% of your jobs ($${topService.revenue.toLocaleString()} revenue). Consider specialized training or equipment to increase efficiency.`,
          type: 'success',
          priority: 'medium',
          impact: `${servicePercentage}% of business volume`,
          action: 'View Jobs',
          actionUrl: '/jobs',
          icon: Target
        });
      }
      
      // Scheduling optimization
      if (underutilizedTechs > 0 && (scheduledJobs.length + inProgressJobs.length) > 0) {
        generatedInsights.push({
          id: 3,
          title: 'Balance Technician Workload',
          description: `${underutilizedTechs} technicians appear underutilized while ${scheduledJobs.length + inProgressJobs.length} jobs are pending. Redistribute workload to improve efficiency.`,
          type: 'warning',
          priority: 'high',
          impact: `Optimize ${scheduledJobs.length + inProgressJobs.length} pending jobs`,
          action: 'Optimize Schedule',
          actionUrl: '/schedule',
          icon: Clock
        });
      }
      
      // Client growth insight
      if (activeClients.length > 0) {
        const jobsPerClient = jobs?.length / activeClients.length || 0;
        if (jobsPerClient < 2) {
          generatedInsights.push({
            id: 4,
            title: 'Increase Client Retention',
            description: `Your ${activeClients.length} active clients average ${jobsPerClient.toFixed(1)} jobs each. Focus on repeat business and maintenance contracts to increase lifetime value.`,
            type: 'info',
            priority: 'medium',
            impact: `${activeClients.length} client relationships`,
            action: 'View Clients',
            actionUrl: '/clients',
            icon: Users
          });
        } else {
          generatedInsights.push({
            id: 4,
            title: 'Strong Client Relationships',
            description: `Excellent! Your ${activeClients.length} clients average ${jobsPerClient.toFixed(1)} jobs each. Consider referral programs to leverage these strong relationships.`,
            type: 'success',
            priority: 'low',
            impact: `${activeClients.length} loyal clients`,
            action: 'View Clients',
            actionUrl: '/clients',
            icon: Star
          });
        }
      }
      
      // Performance metrics insight
      const completionRate = jobs?.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0;
      if (completionRate > 0) {
        generatedInsights.push({
          id: 5,
          title: completionRate > 80 ? 'Excellent Job Completion' : 'Improve Job Completion',
          description: `${completionRate.toFixed(1)}% job completion rate with $${avgJobValue.toFixed(0)} average value. ${completionRate > 80 ? 'Great performance!' : 'Focus on completing pending jobs to boost revenue.'}`,
          type: completionRate > 80 ? 'success' : 'warning',
          priority: completionRate > 80 ? 'low' : 'medium',
          impact: `${completedJobs.length} completed jobs`,
          action: 'View Performance',
          actionUrl: '/reports',
          icon: TrendingUp
        });
      }
      
      // Business growth insight
      if (totalRevenue > 0 && completedJobs.length > 5) {
        const monthlyRevenue = totalRevenue; // Assuming current period revenue
        const projectedAnnual = monthlyRevenue * 12;
        generatedInsights.push({
          id: 6,
          title: 'Business Growth Trajectory',
          description: `Current revenue pace projects to $${projectedAnnual.toLocaleString()} annually. Consider expanding services or team capacity to scale further.`,
          type: 'info',
          priority: 'low',
          impact: `$${projectedAnnual.toLocaleString()} annual projection`,
          action: 'Growth Planning',
          actionUrl: '/reports',
          icon: Zap
        });
      }
      
      // Ensure we have at least some insights
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: 1,
          title: 'Getting Started',
          description: 'Start by adding jobs and clients to get personalized business insights. Your dashboard will show actionable recommendations as your business data grows.',
          type: 'info',
          priority: 'medium',
          impact: 'Foundation building',
          action: 'Add Job',
          actionUrl: '/jobs',
          icon: Brain
        });
      }
      
      // Sort by priority
      generatedInsights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      setInsights(generatedInsights);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error("Error fetching insights data:", error);
      toast.error("Failed to load AI insights", {
        description: "Could not analyze business data. Please try again."
      });
      
      // Fallback insight
      setInsights([{
        id: 1,
        title: 'Data Analysis Error',
        description: 'Unable to analyze your business data at the moment. Please refresh or contact support if the issue persists.',
        type: 'warning',
        priority: 'medium',
        impact: 'System connectivity',
        icon: AlertTriangle
      }]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchInsights();
  }, [user]);
  
  const getBackgroundColor = (type: 'success' | 'warning' | 'info' | 'priority') => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'priority':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getIconColor = (type: 'success' | 'warning' | 'info' | 'priority') => {
    switch (type) {
      case 'success':
        return 'text-emerald-600';
      case 'warning':
        return 'text-amber-600';
      case 'priority':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
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
    toast.success("Refreshing business insights", {
      description: "Analyzing your latest business data"
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl shadow-lg">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-fixlyfy to-fixlyfy-light bg-clip-text text-transparent">
              AI Business Insights
            </h2>
            <p className="text-fixlyfy-text-secondary">Actionable recommendations to grow your business</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-fixlyfy-text-secondary">
              Updated: {new Date(lastRefreshed).toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-2 border-fixlyfy/20 hover:bg-fixlyfy/5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Analyzing..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          insights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`${getBackgroundColor(insight.type)} border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-2.5 rounded-lg ${getIconColor(insight.type)} bg-white/80 shadow-sm`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {getPriorityBadge(insight.priority)}
                    <h3 className="font-semibold text-gray-900 mt-2 mb-1">{insight.title}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {insight.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-full">
                    Impact: {insight.impact}
                  </div>
                  
                  {insight.action && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-medium hover:scale-105 transition-transform"
                      onClick={() => handleAction(insight.actionUrl)}
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {!isLoading && insights.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-lg font-medium mb-2">No insights available</p>
          <p className="text-sm">Add some business data to get personalized recommendations</p>
        </div>
      )}
    </div>
  );
};
