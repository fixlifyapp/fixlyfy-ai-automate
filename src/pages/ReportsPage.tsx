
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { ReportsTechnicians } from "@/components/reports/ReportsTechnicians";
import { ReportsJobs } from "@/components/reports/ReportsJobs";
import { Button } from "@/components/ui/button";
import { Database, Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useTestData } from "@/utils/test-data"; // Updated import path
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalRevenue: number;
  totalJobs: number;
  averageJobValue: number;
  completionRate: number;
  jobsByStatus: {
    [key: string]: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  technicianPerformance: {
    name: string;
    jobsCompleted: number;
    revenue: number;
    rating: number;
  }[];
}

const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const { generateAllTestData } = useTestData();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Function to get date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Set to a date in the past to get all data
        break;
    }
    
    return { startDate, endDate };
  };
  
  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    
    try {
      const { startDate, endDate } = getDateRange();
      
      // Fetch jobs data for the period
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
        
      if (jobsError) throw jobsError;
      
      // Fetch payments data for the period
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
        
      if (paymentsError) throw paymentsError;
      
      // Process jobs data
      const totalJobs = jobsData?.length || 0;
      const completedJobs = jobsData?.filter(job => job.status === 'completed').length || 0;
      const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
      
      // Group jobs by status
      const jobsByStatus = jobsData?.reduce((acc, job) => {
        const status = job.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Calculate revenue
      const totalRevenue = paymentsData?.reduce((sum, payment) => {
        // Check if payment has status, otherwise assume it's paid
        const paymentStatus = (payment as any).status || 'paid';
        return paymentStatus === 'paid' ? sum + payment.amount : sum;
      }, 0) || 0;
      
      const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;
      
      // Group revenue by month
      const revenueByMonth: { month: string, revenue: number }[] = [];
      
      if (paymentsData) {
        const months: Record<string, number> = {};
        
        paymentsData.forEach(payment => {
          // Check if payment has status, otherwise assume it's paid
          const paymentStatus = (payment as any).status || 'paid';
          if (paymentStatus !== 'paid') return;
          
          const date = new Date(payment.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const monthName = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          
          if (!months[monthKey]) {
            months[monthKey] = 0;
          }
          
          months[monthKey] += payment.amount;
          
          // Add to the array ensuring only one entry per month
          const existingMonth = revenueByMonth.findIndex(m => m.month === monthName);
          if (existingMonth >= 0) {
            revenueByMonth[existingMonth].revenue += payment.amount;
          } else {
            revenueByMonth.push({
              month: monthName,
              revenue: payment.amount
            });
          }
        });
      }
      
      // Sort revenue by month chronologically
      revenueByMonth.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Fetch technicians data
      const { data: techniciansData, error: techniciansError } = await supabase
        .from('profiles')
        .select('id, name, role');
        
      if (techniciansError) throw techniciansError;
      
      // Calculate technician performance
      const technicianPerformance = [];
      
      for (const tech of techniciansData || []) {
        if (tech.role !== 'technician' && tech.role !== 'manager') continue;
        
        // Get jobs completed by this technician
        const techJobs = jobsData?.filter(job => job.technician_id === tech.id) || [];
        
        // Calculate revenue generated
        const techRevenue = techJobs.reduce((sum, job) => sum + (job.revenue || 0), 0);
        
        // Calculate average rating (if we had client ratings in the future)
        const rating = 4.5; // Placeholder for now
        
        technicianPerformance.push({
          name: tech.name || 'Unknown',
          jobsCompleted: techJobs.length,
          revenue: techRevenue,
          rating
        });
      }
      
      // Sort technicians by revenue
      technicianPerformance.sort((a, b) => b.revenue - a.revenue);
      
      // Set the analytics data
      setAnalyticsData({
        totalRevenue,
        totalJobs,
        averageJobValue,
        completionRate,
        jobsByStatus,
        revenueByMonth,
        technicianPerformance
      });
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };
  
  const handleExportData = () => {
    if (!analyticsData) return;
    
    try {
      // Prepare CSV data for export
      const csvData = [
        ['Report Period', period],
        ['Generated Date', new Date().toISOString()],
        [''],
        ['SUMMARY METRICS'],
        ['Total Revenue', `$${analyticsData.totalRevenue.toFixed(2)}`],
        ['Total Jobs', analyticsData.totalJobs.toString()],
        ['Average Job Value', `$${analyticsData.averageJobValue.toFixed(2)}`],
        ['Completion Rate', `${analyticsData.completionRate.toFixed(1)}%`],
        [''],
        ['JOBS BY STATUS'],
        ...Object.entries(analyticsData.jobsByStatus).map(([status, count]) => [status, count.toString()]),
        [''],
        ['REVENUE BY MONTH'],
        ...analyticsData.revenueByMonth.map(data => [data.month, `$${data.revenue.toFixed(2)}`]),
        [''],
        ['TECHNICIAN PERFORMANCE'],
        ['Name', 'Jobs Completed', 'Revenue', 'Rating'],
        ...analyticsData.technicianPerformance.map(tech => [
          tech.name,
          tech.jobsCompleted.toString(),
          `$${tech.revenue.toFixed(2)}`,
          tech.rating.toString()
        ])
      ];
      
      // Convert to CSV format
      const csvString = csvData.map(row => row.join(',')).join('\n');
      
      // Create a download link
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fixlyfy-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };
  
  const handleGenerateTestData = async () => {
    if (!user) {
      toast.error("You need to be signed in to generate test data", {
        description: "Please sign in first to use this feature"
      });
      return;
    }
    
    setIsGeneratingData(true);
    toast.loading("Generating test data...", { id: "generate-data" });
    
    try {
      // Improved error handling and detailed logging
      console.log("Starting test data generation with user:", user);
      
      // Generate 10 clients and 20 jobs - fewer for faster processing
      toast.loading("Creating test clients and jobs...", { id: "clients-data" });
      const clientIds = await generateAllTestData(10, 20);
      console.log("Generated client IDs:", clientIds);
      
      toast.dismiss("clients-data");
      toast.dismiss("generate-data");
      
      if (clientIds && clientIds.length > 0) {
        toast.success("Test data created successfully", {
          description: `${clientIds.length} clients and 20 jobs created for testing`
        });
        // Refresh analytics after generating test data
        fetchAnalyticsData();
      } else {
        toast.error("No clients were created", {
          description: "Please check console for details"
        });
      }
    } catch (error) {
      console.error("Detailed test data generation error:", error);
      toast.dismiss("clients-data");
      toast.dismiss("generate-data");
      toast.error("Failed to generate test data", {
        description: "An error occurred while creating test data. See console for details."
      });
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);
  
  return (
    <PageLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-fixlyfy-text-secondary">
            Analyze your business performance with detailed reports and insights.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleExportData}
            variant="outline"
            size={isMobile ? "default" : "lg"}
            className="w-full md:w-auto"
            disabled={!analyticsData || isLoadingAnalytics}
          >
            <FileDown size={isMobile ? 16 : 20} className="mr-2" />
            Export Report
          </Button>
          <Button
            onClick={handleGenerateTestData}
            variant="default"
            size={isMobile ? "default" : "lg"}
            className="bg-violet-600 hover:bg-violet-700 w-full md:w-auto"
            disabled={isGeneratingData}
          >
            {isGeneratingData ? (
              <>
                <Loader2 size={isMobile ? 16 : 20} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database size={isMobile ? 16 : 20} className="mr-2" />
                Generate Test Data
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="fixlyfy-card p-4 mb-6">
        <ReportsFilters period={period} setPeriod={setPeriod} />
      </div>
      
      <ReportsOverview 
        period={period} 
        isLoading={isLoadingAnalytics}
        data={analyticsData || undefined}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ReportsCharts 
            period={period} 
            isLoading={isLoadingAnalytics}
            revenueByMonth={analyticsData?.revenueByMonth}
            jobsByStatus={analyticsData?.jobsByStatus}
          />
        </div>
        <div>
          <ReportsTechnicians 
            period={period} 
            isLoading={isLoadingAnalytics}
            technicianPerformance={analyticsData?.technicianPerformance}
          />
        </div>
      </div>
      
      <div className="mt-6">
        <ReportsJobs period={period} isLoading={isLoadingAnalytics} />
      </div>
    </PageLayout>
  );
};

export default ReportsPage;
