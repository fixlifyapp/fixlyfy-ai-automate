
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUpIcon, ArrowDownIcon, DollarSign, CalendarClock } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type TimeFilter = 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  change?: number;
  changeLabel?: string;
  isLoading: boolean;
}

export const ExpandedDashboardMetrics = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('thisMonth');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    salesTotal: 0,
    amountCollected: 0,
    jobsCompleted: 0,
    jobsCancelled: 0,
    jobsCreated: 0,
    openJobs: 0,
    totalRevenue: 0,
    previousTotalRevenue: 0,
    previousOpenJobs: 0,
    topTechnicians: [] as { name: string; job_count: number; total_revenue: number }[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Helper function to get date range based on selected filter
  const getDateRange = (): DateRange => {
    const today = new Date();
    
    switch (timeFilter) {
      case 'today':
        return {
          from: startOfDay(today),
          to: endOfDay(today)
        };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        };
      case 'last7days':
        return {
          from: startOfDay(subDays(today, 6)), // Last 7 days including today
          to: endOfDay(today)
        };
      case 'thisMonth':
        return {
          from: startOfMonth(today),
          to: endOfDay(today)
        };
      case 'custom':
        return customDateRange;
      default:
        return {
          from: startOfMonth(today),
          to: endOfDay(today)
        };
    }
  };

  // Fetch all metrics data
  const fetchMetricsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      // Calculate previous period date range for comparisons
      const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
      const previousStartDate = new Date(dateRange.from.getTime() - periodLength).toISOString();
      const previousEndDate = new Date(dateRange.from.getTime() - 1).toISOString();

      // Fetch sales total (invoiced total)
      const { data: salesData, error: salesError } = await supabase
        .from('invoices')
        .select('total')
        .in('status', ['paid', 'sent'])
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (salesError) throw salesError;
      
      const salesTotal = salesData?.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0) || 0;

      // Fetch amount collected (payments)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate);

      if (paymentsError) throw paymentsError;
      
      const amountCollected = paymentsData?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;

      // Fetch jobs completed
      const { count: jobsCompleted, error: completedError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (completedError) throw completedError;

      // Fetch jobs cancelled
      const { count: jobsCancelled, error: cancelledError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'cancelled')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (cancelledError) throw cancelledError;

      // Fetch jobs created
      const { count: jobsCreated, error: createdError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (createdError) throw createdError;

      // Fetch open jobs (scheduled or in_progress)
      const { count: openJobs, error: openJobsError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .in('status', ['scheduled', 'in_progress', 'in-progress'])
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (openJobsError) throw openJobsError;

      // Fetch previous period open jobs for comparison
      const { count: previousOpenJobs } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .in('status', ['scheduled', 'in_progress', 'in-progress'])
        .gte('created_at', previousStartDate)
        .lte('created_at', previousEndDate);

      // Fetch total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('jobs')
        .select('revenue')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (revenueError) throw revenueError;
      
      const totalRevenue = revenueData?.reduce((sum, job) => sum + (Number(job.revenue) || 0), 0) || 0;

      // Fetch previous period revenue for comparison
      const { data: previousRevenueData } = await supabase
        .from('jobs')
        .select('revenue')
        .eq('status', 'completed')
        .gte('created_at', previousStartDate)
        .lte('created_at', previousEndDate);
        
      const previousTotalRevenue = previousRevenueData?.reduce((sum, job) => sum + (Number(job.revenue) || 0), 0) || 0;

      // Fetch top technicians by completed jobs
      const { data: technicianData, error: techError } = await supabase
        .from('jobs')
        .select(`
          technician_id,
          revenue
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
        
      if (techError) throw techError;
      
      // Process technician data to get top performers
      if (technicianData && technicianData.length > 0) {
        // Get unique technician IDs
        const techIds = Array.from(
          new Set(technicianData.filter(job => job.technician_id).map(job => job.technician_id)) as Set<string>
        );
        
        if (techIds.length > 0) {
          // Fetch technician names
          const { data: techProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', techIds);
            
          if (profilesError) throw profilesError;
          
          // Create a map of technician IDs to their names
          const techNameMap: Record<string, string> = {};
          if (techProfiles) {
            techProfiles.forEach(profile => {
              if (profile.id) {
                techNameMap[profile.id] = profile.name || 'Unknown';
              }
            });
          }
          
          // Calculate metrics per technician
          const techStats: Record<string, { name: string; job_count: number; total_revenue: number }> = {};
          
          technicianData.forEach(job => {
            if (job.technician_id && techNameMap[job.technician_id]) {
              const techId = job.technician_id;
              
              if (!techStats[techId]) {
                techStats[techId] = {
                  name: techNameMap[techId],
                  job_count: 0,
                  total_revenue: 0
                };
              }
              
              techStats[techId].job_count += 1;
              techStats[techId].total_revenue += Number(job.revenue) || 0;
            }
          });
          
          // Sort by revenue and get top 5
          const topTechs = Object.values(techStats)
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, 5);
            
          setMetrics(prev => ({
            ...prev,
            topTechnicians: topTechs
          }));
        }
      }

      setMetrics(prev => ({
        ...prev,
        salesTotal,
        amountCollected,
        jobsCompleted: jobsCompleted || 0,
        jobsCancelled: jobsCancelled || 0,
        jobsCreated: jobsCreated || 0,
        openJobs: openJobs || 0,
        totalRevenue,
        previousTotalRevenue,
        previousOpenJobs: previousOpenJobs || 1, // Avoid division by zero
      }));
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsData();
  }, [user, timeFilter, customDateRange]);

  // Handle time filter change
  const handleTimeFilterChange = (value: TimeFilter) => {
    setTimeFilter(value);
    if (value === 'custom') {
      setIsDatePickerOpen(true);
    } else {
      setIsDatePickerOpen(false);
    }
  };

  // Handle custom date range selection
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setCustomDateRange({
        from: range.from,
        to: range.to
      });
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatDate = (date: Date): string => {
    return format(date, 'MMM d, yyyy');
  };

  const formatDateRange = (from: Date, to: Date): string => {
    if (format(from, 'MMM yyyy') === format(to, 'MMM yyyy')) {
      return `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`;
    }
    return `${formatDate(from)} - ${formatDate(to)}`;
  };

  const getFilterLabel = (): string => {
    const range = getDateRange();
    
    switch (timeFilter) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
        return 'Last 7 Days';
      case 'thisMonth':
        return 'This Month';
      case 'custom':
        return formatDateRange(range.from, range.to);
      default:
        return 'This Month';
    }
  };

  const MetricCard = ({ title, value, icon, iconColor, change, changeLabel, isLoading }: MetricCardProps) => (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-md ${iconColor}`}>
                {icon}
              </div>
              {change !== undefined && (
                <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm text-fixlyfy-text-secondary">{title}</h3>
              <p className="text-2xl font-semibold mt-1">{value}</p>
              {changeLabel && (
                <p className="text-xs text-fixlyfy-text-secondary mt-1">{changeLabel}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const calculateRevenueChange = () => {
    if (metrics.previousTotalRevenue === 0) return 0;
    return Math.round(((metrics.totalRevenue - metrics.previousTotalRevenue) / metrics.previousTotalRevenue) * 100);
  };

  const calculateOpenJobsChange = () => {
    if (metrics.previousOpenJobs === 0) return 0;
    return Math.round(((metrics.openJobs - metrics.previousOpenJobs) / metrics.previousOpenJobs) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">Dashboard Metrics</h2>
        <div>
          <Select value={timeFilter} onValueChange={(value) => handleTimeFilterChange(value as TimeFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>{getFilterLabel()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeFilter === 'custom' && (
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {customDateRange.from && customDateRange.to
                    ? formatDateRange(customDateRange.from, customDateRange.to)
                    : 'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{
                    from: customDateRange.from,
                    to: customDateRange.to
                  }}
                  onSelect={handleDateRangeChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")} 
                />
                <div className="p-3 border-t border-border flex justify-end">
                  <Button size="sm" onClick={() => setIsDatePickerOpen(false)}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button variant="ghost" onClick={fetchMetricsData}>
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Top Performing Technicians</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
          </div>
        ) : metrics.topTechnicians.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {metrics.topTechnicians.map((tech, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{tech.name}</h3>
                      <p className="text-fixlyfy-text-secondary text-sm">{tech.job_count} Jobs Completed</p>
                    </div>
                    <div className="bg-fixlyfy text-white px-2 py-1 rounded-md text-sm font-medium">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xl font-semibold">{formatValue(tech.total_revenue)}</p>
                    <p className="text-xs text-fixlyfy-text-secondary">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-fixlyfy-text-secondary">
              <p>No technician data available for this period</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
