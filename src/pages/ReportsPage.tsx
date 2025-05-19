
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { ReportsTechnicians } from "@/components/reports/ReportsTechnicians";
import { ReportsJobs } from "@/components/reports/ReportsJobs";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { toast } from "sonner";
import { useTestData } from "@/utils/test-data-generator";

const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const { generateTestClients, generateTestJobs } = useTestData();
  
  const handleGenerateTestData = async () => {
    setIsGeneratingData(true);
    toast.loading("Generating minimal test data...");
    
    try {
      // Generate only 5 clients
      const clientIds = await generateTestClients(5);
      
      // Generate only 5 jobs
      if (clientIds.length > 0) {
        await generateTestJobs(clientIds, 5);
      }
      
      toast.dismiss();
      toast.success("Test data created successfully", {
        description: "5 clients and 5 jobs created for testing"
      });
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate test data", {
        description: "An error occurred while creating test data"
      });
      console.error("Test data generation error:", error);
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-fixlyfy-text-secondary">
            Analyze your business performance with detailed reports and insights.
          </p>
        </div>
        <Button
          onClick={handleGenerateTestData}
          variant="default"
          size="lg"
          className="bg-violet-600 hover:bg-violet-700"
          disabled={isGeneratingData}
        >
          <Database size={20} className="mr-2" />
          {isGeneratingData ? "Generating..." : "Generate Test Data (5)"}
        </Button>
      </div>
      
      <div className="fixlyfy-card p-4 mb-6">
        <ReportsFilters period={period} setPeriod={setPeriod} />
      </div>
      
      <ReportsOverview period={period} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ReportsCharts period={period} />
        </div>
        <div>
          <ReportsTechnicians period={period} />
        </div>
      </div>
      
      <div className="mt-6">
        <ReportsJobs period={period} />
      </div>
    </PageLayout>
  );
};

export default ReportsPage;
