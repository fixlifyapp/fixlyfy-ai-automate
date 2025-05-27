
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
  AIAgentWidget
} from "@/components/dashboard";

export type { TimePeriod };

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <PageLayout>
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

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedKpiCards />
        </div>

        {/* Enhanced Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts />
            <ModernMetricsGrid />
          </div>

          {/* Right Column - Widgets and Insights */}
          <div className="space-y-6">
            <AiInsightsPanel />
            <AIAgentWidget />
            <ClientValuePanel />
            <QuickActionsPanel />
          </div>
        </div>

        {/* Secondary Metrics and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentJobs />
          <UpcomingJobs />
        </div>

        {/* Full Width Sections */}
        <ActivityFeed />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
