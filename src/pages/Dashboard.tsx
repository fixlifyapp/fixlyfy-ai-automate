import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { KpiSummaryCards } from "@/components/dashboard/KpiSummaryCards";
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

// Define time period types for filters
export type TimePeriod = "week" | "month" | "quarter" | "custom";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFilterChange = (period: TimePeriod, range?: { from: Date | undefined; to: Date | undefined }) => {
    setTimePeriod(period);
    if (range) {
      setDateRange(range);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In a real application, this would refresh data from your API
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
      
      {/* KPI Summary Cards */}
      <div className="mb-6">
        <KpiSummaryCards 
          timePeriod={timePeriod} 
          dateRange={dateRange} 
          isRefreshing={isRefreshing}
        />
      </div>
      
      {/* Scoreboard Section (New) */}
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
