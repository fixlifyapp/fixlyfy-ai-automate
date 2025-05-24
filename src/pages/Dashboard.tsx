
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { TrendCharts } from "@/components/dashboard/TrendCharts";
import { AiInsightsPanel } from "@/components/dashboard/AiInsightsPanel";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";
import { InvoiceStatusBreakdown } from "@/components/dashboard/InvoiceStatusBreakdown";
import { ClientStats } from "@/components/dashboard/ClientStats";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { TechScoreboard } from "@/components/dashboard/TechScoreboard";
import { DispatchScoreboard } from "@/components/dashboard/DispatchScoreboard";
import { ExpandedDashboardMetrics } from "@/components/dashboard/ExpandedDashboardMetrics";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Define time period types for filters
export type TimePeriod = "week" | "month" | "quarter" | "custom";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExpandedMetrics, setShowExpandedMetrics] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  console.log('Dashboard: Component mounted', { user, authLoading });

  useEffect(() => {
    console.log('Dashboard: User state changed', { user, authLoading });
    
    if (!authLoading && !user) {
      console.log('Dashboard: No authenticated user found');
      setDashboardError('Authentication required');
      toast.error('Please sign in to view the dashboard');
    } else if (user) {
      console.log('Dashboard: User authenticated successfully');
      setDashboardError(null);
    }
  }, [user, authLoading]);

  const handleFilterChange = (period: TimePeriod, range?: { from: Date | undefined; to: Date | undefined }) => {
    console.log('Dashboard: Filter changed', { period, range });
    setTimePeriod(period);
    if (range) {
      setDateRange(range);
    }
  };
  
  const handleRefresh = async () => {
    console.log('Dashboard: Refresh triggered');
    setIsRefreshing(true);
    try {
      // In a real application, this would refresh data from your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Dashboard: Error during refresh:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleExpandedMetrics = () => {
    console.log('Dashboard: Toggling expanded metrics');
    setShowExpandedMetrics(!showExpandedMetrics);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    console.log('Dashboard: Rendering auth loading state');
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto animate-spin text-fixlyfy mb-4" />
            <p className="text-fixlyfy-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state if there's an issue
  if (dashboardError) {
    console.log('Dashboard: Rendering error state', { dashboardError });
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-2">Dashboard Error</div>
            <div className="text-sm text-gray-600 mb-4">{dashboardError}</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  console.log('Dashboard: Rendering main dashboard content');

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-fixlyfy-text-secondary">Welcome to your business overview</p>
        </div>
        <DashboardActions onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <DashboardFilterControls 
          currentPeriod={timePeriod} 
          dateRange={dateRange} 
          onFilterChange={handleFilterChange} 
        />
      </div>
      
      {/* Expanded Dashboard Metrics (New) */}
      <div className="mb-8">
        <button 
          onClick={handleToggleExpandedMetrics}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          View Detailed Metrics
        </button>
        
        {showExpandedMetrics && (
          <ExpandedDashboardMetrics onClose={handleToggleExpandedMetrics} />
        )}
      </div>
      
      {/* KPI Summary Cards section has been removed */}
      
      {/* Scoreboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TechScoreboard isRefreshing={isRefreshing} />
        <DispatchScoreboard isRefreshing={isRefreshing} />
      </div>
      
      {/* Trend Charts Section */}
      <div className="mb-6">
        <TrendCharts 
          timePeriod={timePeriod} 
          dateRange={dateRange}
          isRefreshing={isRefreshing}
        />
      </div>
      
      {/* AI Insights Panel */}
      <div className="mb-6">
        <AiInsightsPanel />
      </div>
      
      {/* Dashboard Grid - Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming/Overdue Jobs */}
        <div>
          <UpcomingJobs isRefreshing={isRefreshing} />
        </div>
        
        {/* Invoice Status Breakdown */}
        <div>
          <InvoiceStatusBreakdown isRefreshing={isRefreshing} />
        </div>
      </div>
      
      {/* Client Stats */}
      <div className="mb-6">
        <ClientStats 
          timePeriod={timePeriod} 
          dateRange={dateRange}
          isRefreshing={isRefreshing} 
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
