import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { TimePeriod } from "@/pages/Dashboard";
import { toast } from "sonner";

interface KpiData {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  loading: boolean;
}

interface KpiSummaryCardsProps {
  timePeriod: TimePeriod;
  dateRange: { from: Date | undefined; to: Date | undefined };
  isRefreshing?: boolean;
}

// Dynamic import of icons
import { DollarSign, CheckCircle, CalendarClock, Clock, LineChart, UserCheck } from "lucide-react";

export const KpiSummaryCards = ({ timePeriod, dateRange, isRefreshing = false }: KpiSummaryCardsProps) => {
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Create date filters based on time period
        let fromDate, toDate;
        const now = new Date();
        
        if (timePeriod === "custom" && dateRange.from && dateRange.to) {
          fromDate = dateRange.from.toISOString();
          toDate = dateRange.to.toISOString();
        } else {
          // Calculate date range based on selected period
          const today = new Date();
          
          if (timePeriod === "week") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            fromDate = oneWeekAgo.toISOString();
          } else if (timePeriod === "month") {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(today.getMonth() - 1);
            fromDate = oneMonthAgo.toISOString();
          } else if (timePeriod === "quarter") {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(today.getDate() - 90);
            fromDate = ninetyDaysAgo.toISOString();
          }
          
          toDate = today.toISOString();
        }
        
        // Get total revenue from paid invoices
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('total')
          .eq('status', 'paid')
          .gte('date', fromDate)
          .lte('date', toDate);
          
        if (invoicesError) throw invoicesError;
        
        const totalRevenue = invoicesData?.reduce((sum, invoice) => sum + invoice.total, 0) || 0;
        
        // Get previous period revenue for comparison
        const previousFromDate = new Date(new Date(fromDate).getTime() - (new Date(toDate).getTime() - new Date(fromDate).getTime())).toISOString();
        const previousToDate = new Date(new Date(fromDate).getTime() - 1).toISOString();
        
        const { data: previousInvoicesData } = await supabase
          .from('invoices')
          .select('total')
          .eq('status', 'paid')
          .gte('date', previousFromDate)
          .lte('date', previousToDate);
          
        const previousRevenue = previousInvoicesData?.reduce((sum, invoice) => sum + invoice.total, 0) || 1; // Avoid division by zero
        const revenueChange = Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100);
        
        // Get jobs completed
        const { data: completedJobsData, error: completedJobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('status', 'completed')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);
          
        if (completedJobsError) throw completedJobsError;
        
        // Get previous period completed jobs for comparison
        const { data: previousCompletedJobsData } = await supabase
          .from('jobs')
          .select('id')
          .eq('status', 'completed')
          .gte('created_at', previousFromDate)
          .lte('created_at', previousToDate);
          
        const completedJobs = completedJobsData?.length || 0;
        const previousCompletedJobs = previousCompletedJobsData?.length || 1; // Avoid division by zero
        const jobsCompletedChange = Math.round(((completedJobs - previousCompletedJobs) / previousCompletedJobs) * 100);
        
        // Get open jobs (scheduled or in_progress)
        const { data: openJobsData, error: openJobsError } = await supabase
          .from('jobs')
          .select('id')
          .in('status', ['scheduled', 'in_progress', 'in-progress'])
          .gte('created_at', fromDate)
          .lte('created_at', toDate);
          
        if (openJobsError) throw openJobsError;
        
        // Get previous period open jobs for comparison
        const { data: previousOpenJobsData } = await supabase
          .from('jobs')
          .select('id')
          .in('status', ['scheduled', 'in_progress', 'in-progress'])
          .gte('created_at', previousFromDate)
          .lte('created_at', previousToDate);
          
        const openJobs = openJobsData?.length || 0;
        const previousOpenJobs = previousOpenJobsData?.length || 1; // Avoid division by zero
        const openJobsChange = Math.round(((openJobs - previousOpenJobs) / previousOpenJobs) * 100);
        
        // For demo purposes, calculate average response time (we don't have this data directly)
        const avgResponseTime = 24; // hours, mocked for now
        const prevAvgResponseTime = 26; // hours, mocked for now
        const responseTimeChange = Math.round(((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100);
        
        // For demo purposes, calculate conversion rate (we don't have this data directly)
        const conversionRate = 65; // percentage, mocked for now
        const prevConversionRate = 62; // percentage, mocked for now
        const conversionRateChange = Math.round(((conversionRate - prevConversionRate) / prevConversionRate) * 100);
        
        // For demo purposes, calculate client satisfaction (we don't have this data directly)
        const clientSatisfaction = 4.8; // out of 5, mocked for now
        const prevClientSatisfaction = 4.7; // out of 5, mocked for now
        const clientSatisfactionChange = Math.round(((clientSatisfaction - prevClientSatisfaction) / prevClientSatisfaction) * 100);
        
        // Set KPI data
        setKpis([
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            change: revenueChange,
            isPositive: revenueChange >= 0,
            icon: DollarSign,
            iconColor: 'bg-fixlyfy',
            loading: false
          },
          {
            title: 'Jobs Completed',
            value: completedJobs.toString(),
            change: jobsCompletedChange,
            isPositive: jobsCompletedChange >= 0,
            icon: CheckCircle,
            iconColor: 'bg-fixlyfy-success',
            loading: false
          },
          {
            title: 'Open Jobs',
            value: openJobs.toString(),
            change: openJobsChange,
            isPositive: openJobsChange < 0, // For open jobs, negative change is good
            icon: CalendarClock,
            iconColor: 'bg-fixlyfy-warning',
            loading: false
          },
          {
            title: 'Avg Response Time',
            value: `${avgResponseTime} hrs`,
            change: responseTimeChange,
            isPositive: responseTimeChange <= 0, // For response time, negative change is good
            icon: Clock,
            iconColor: 'bg-fixlyfy-info',
            loading: false
          },
          {
            title: 'Conversion Rate',
            value: `${conversionRate}%`,
            change: conversionRateChange,
            isPositive: conversionRateChange >= 0,
            icon: LineChart,
            iconColor: 'bg-fixlyfy-primary',
            loading: false
          },
          {
            title: 'Client Satisfaction',
            value: clientSatisfaction.toString(),
            change: clientSatisfactionChange,
            isPositive: clientSatisfactionChange >= 0,
            icon: UserCheck,
            iconColor: 'bg-fixlyfy-success/80',
            loading: false
          }
        ]);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        toast.error('Failed to load KPI data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, [user, timePeriod, dateRange, isRefreshing]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {isLoading || isRefreshing
        ? Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-8 w-8 rounded-md mr-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-28 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))
        : kpis.map((kpi, index) => (
            <Card key={index} className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className={cn("p-2 rounded-md mr-2 text-white", kpi.iconColor)}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm text-fixlyfy-text-secondary">{kpi.title}</h3>
                </div>
                <p className="text-2xl font-semibold mb-1">{kpi.value}</p>
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center text-sm font-medium",
                      kpi.isPositive ? "text-fixlyfy-success" : "text-fixlyfy-error"
                    )}
                  >
                    {kpi.isPositive ? (
                      <ArrowUpIcon size={14} className="mr-1" />
                    ) : (
                      <ArrowDownIcon size={14} className="mr-1" />
                    )}
                    {Math.abs(kpi.change)}%
                  </div>
                  <span className="text-xs text-fixlyfy-text-secondary ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  );
};
