
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { BarChart3, Zap, Bot, Target } from "lucide-react";
import { TimePeriod } from "@/types/dashboard";
import {
  EnhancedKpiCards,
  DashboardCharts,
  ModernMetricsGrid,
  AiInsightsPanel,
  ClientValuePanel,
  QuickActionsPanel,
  RecentJobs,
  UpcomingJobs,
  ActivityFeed,
  AIAgentWidget,
  DashboardFilterControls
} from "@/components/dashboard";

export type { TimePeriod };

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const handleFilterChange = (period: TimePeriod, range?: { from: Date | undefined; to: Date | undefined }) => {
    setTimePeriod(period);
    if (range) {
      setDateRange(range);
    }
    setIsRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Get an overview of your business performance and key metrics"
          icon={BarChart3}
          badges={[
            { text: "Real-time", icon: Zap, variant: "fixlyfy" },
            { text: "AI Insights", icon: Bot, variant: "success" },
            { text: "Multi-metric", icon: Target, variant: "info" }
          ]}
        />

        {/* Filter Controls */}
        <div className="flex justify-end">
          <DashboardFilterControls
            currentPeriod={timePeriod}
            dateRange={dateRange}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Key Metrics - Fixed Grid Layout */}
        <div className="w-full">
          <EnhancedKpiCards 
            timePeriod={timePeriod}
            dateRange={dateRange}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Enhanced Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Charts and Metrics */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <DashboardCharts />
            <ModernMetricsGrid />
          </div>

          {/* Right Column - Widgets and Insights */}
          <div className="space-y-4 lg:space-y-6">
            <AiInsightsPanel />
            <AIAgentWidget />
            <ClientValuePanel />
            <QuickActionsPanel />
          </div>
        </div>

        {/* Secondary Metrics and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <RecentJobs />
          <UpcomingJobs />
        </div>

        {/* Full Width Activity Feed */}
        <div className="w-full">
          <ActivityFeed />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
