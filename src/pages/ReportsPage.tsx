
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
      // Improved error handling and more detailed logging
      console.log("Starting test data generation with user:", user);
      
      // Generate 10 clients and 20 jobs - fewer for faster processing
      toast.loading("Creating test clients...", { id: "clients-data" });
      const clientIds = await generateAllTestData(10, 20);
      console.log("Generated client IDs:", clientIds);
      
      toast.dismiss("clients-data");
      toast.dismiss("generate-data");
      
      if (clientIds && clientIds.length > 0) {
        toast.success("Test data created successfully", {
          description: `${clientIds.length} clients and 20 jobs created for testing`
        });
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
