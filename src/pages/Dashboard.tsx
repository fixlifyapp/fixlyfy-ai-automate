
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { TrendCharts } from "@/components/dashboard/TrendCharts";
import { AiInsightsPanel } from "@/components/dashboard/AiInsightsPanel";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";
import { InvoiceStatusBreakdown } from "@/components/dashboard/InvoiceStatusBreakdown";
import { ClientStats } from "@/components/dashboard/ClientStats";
import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { ExpandedDashboardMetrics } from "@/components/dashboard/ExpandedDashboardMetrics";
import { EnhancedKpiCards } from "@/components/dashboard/EnhancedKpiCards";
import { ModernMetricsGrid } from "@/components/dashboard/ModernMetricsGrid";
import { ClientValuePanel } from "@/components/dashboard/ClientValuePanel";
import { QuoteConversionFunnel } from "@/components/dashboard/QuoteConversionFunnel";
import { RepeatWorkTracker } from "@/components/dashboard/RepeatWorkTracker";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Sparkles, BarChart3, TrendingUp, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your business command center"
        icon={BarChart3}
        badges={[
          { text: "Real-time Analytics", icon: TrendingUp, variant: "fixlyfy" },
          { text: "Smart Insights", icon: Target, variant: "success" },
          { text: "AI Powered", icon: Sparkles, variant: "info" }
        ]}
      />

      {/* AI Business Insights Panel - Moved to Top */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <AiInsightsPanel />
        </div>
      </div>

      {/* Filter Controls with Enhanced Design */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <DashboardFilterControls 
            currentPeriod={timePeriod} 
            dateRange={dateRange} 
            onFilterChange={handleFilterChange} 
          />
        </div>
      </div>
      
      {/* Enhanced KPI Cards with 3D Effects */}
      <div className="mb-8">
        <EnhancedKpiCards 
          timePeriod={timePeriod} 
          dateRange={dateRange}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Modern Metrics Grid */}
      <div className="mb-8">
        <ModernMetricsGrid isRefreshing={isRefreshing} />
      </div>
      
      {/* NEW: Client Value & Churn Analysis */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Client Analytics & Insights
          </h2>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            🆕 New Feature
          </Badge>
        </div>
        <ClientValuePanel />
      </div>
      
      {/* NEW: Quote Conversion & Repeat Work Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <QuoteConversionFunnel />
        <RepeatWorkTracker />
      </div>
      
      {/* Expanded Dashboard Metrics Toggle */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <button 
            onClick={handleToggleExpandedMetrics}
            className="bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy-light hover:to-fixlyfy text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View Detailed Metrics
          </button>
          
          {showExpandedMetrics && (
            <div className="mt-6">
              <ExpandedDashboardMetrics onClose={handleToggleExpandedMetrics} />
            </div>
          )}
        </div>
      </div>
      
      {/* Trend Charts Section with Enhanced Container */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <TrendCharts 
            timePeriod={timePeriod} 
            dateRange={dateRange}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
      
      {/* Dashboard Grid - Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <UpcomingJobs isRefreshing={isRefreshing} />
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <InvoiceStatusBreakdown isRefreshing={isRefreshing} />
        </div>
      </div>
      
      {/* Client Stats with Enhanced Design */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <ClientStats 
            timePeriod={timePeriod} 
            dateRange={dateRange}
            isRefreshing={isRefreshing} 
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
