
import { DollarSign, CalendarClock } from "lucide-react";
import { MetricCard } from "./metrics/MetricCard";
import { DateRangeSelector } from "./metrics/DateRangeSelector";
import { TopTechnicians } from "./metrics/TopTechnicians";
import { useMetricsData } from "./metrics/useMetricsData";

export const ExpandedDashboardMetrics = () => {
  const {
    metrics,
    isLoading,
    timeFilter,
    customDateRange,
    getFilterLabel,
    handleTimeFilterChange,
    handleDateRangeChange,
    formatValue,
    fetchMetricsData,
    calculateRevenueChange,
    calculateOpenJobsChange
  } = useMetricsData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">Dashboard Metrics</h2>
        <DateRangeSelector
          timeFilter={timeFilter}
          customDateRange={customDateRange}
          isLoading={isLoading}
          getFilterLabel={getFilterLabel}
          onTimeFilterChange={handleTimeFilterChange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={fetchMetricsData}
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Revenue"
          value={formatValue(metrics.totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-white" />}
          iconColor="bg-blue-500"
          change={calculateRevenueChange()}
          isLoading={isLoading}
          changeLabel="vs previous period"
        />
        <MetricCard
          title="Open Jobs"
          value={metrics.openJobs.toString()}
          icon={<CalendarClock className="h-4 w-4 text-white" />}
          iconColor="bg-amber-500"
          change={calculateOpenJobsChange()}
          isLoading={isLoading}
          changeLabel="vs previous period"
        />
        <MetricCard
          title="Sales (Invoiced Total)"
          value={formatValue(metrics.salesTotal)}
          icon={<span className="text-white text-lg">$</span>}
          iconColor="bg-blue-500"
          isLoading={isLoading}
          changeLabel="Invoices marked as paid or sent"
        />
        <MetricCard
          title="Amount Collected"
          value={formatValue(metrics.amountCollected)}
          icon={<span className="text-white text-lg">💰</span>}
          iconColor="bg-green-500"
          isLoading={isLoading}
          changeLabel="Sum of actual payments logged"
        />
        <MetricCard
          title="Jobs Completed"
          value={metrics.jobsCompleted.toString()}
          icon={<span className="text-white text-lg">✅</span>}
          iconColor="bg-fixlyfy-success"
          isLoading={isLoading}
          changeLabel="Jobs with status completed"
        />
        <MetricCard
          title="Jobs Cancelled"
          value={metrics.jobsCancelled.toString()}
          icon={<span className="text-white text-lg">❌</span>}
          iconColor="bg-fixlyfy-error"
          isLoading={isLoading}
          changeLabel="Jobs with status cancelled"
        />
        <MetricCard
          title="Jobs Created"
          value={metrics.jobsCreated.toString()}
          icon={<span className="text-white text-lg">🆕</span>}
          iconColor="bg-indigo-500"
          isLoading={isLoading}
          changeLabel="All jobs created in period"
        />
      </div>
      
      {/* Top Performing Technicians */}
      <TopTechnicians 
        technicians={metrics.topTechnicians}
        isLoading={isLoading}
        formatValue={formatValue}
      />
    </div>
  );
};
