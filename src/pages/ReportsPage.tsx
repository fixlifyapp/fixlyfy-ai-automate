
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { ReportsTechnicians } from "@/components/reports/ReportsTechnicians";
import { ReportsJobs } from "@/components/reports/ReportsJobs";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTestData } from "@/utils/test-data-generator";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const { generateAllTestData } = useTestData();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
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
      // Generate 20 clients and 40 jobs
      await generateAllTestData(20, 40);
      
      toast.dismiss("generate-data");
      toast.success("Test data created successfully", {
        description: "20 clients and 40 jobs created for testing"
      });
    } catch (error) {
      toast.dismiss("generate-data");
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-fixlyfy-text-secondary">
            Analyze your business performance with detailed reports and insights.
          </p>
        </div>
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
