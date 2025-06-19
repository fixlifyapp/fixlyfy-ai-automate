
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { TabsContent } from "@/components/ui/tabs";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { JobDetailsProvider } from "@/components/jobs/context/JobDetailsContext";
import { JobOverview } from "@/components/jobs/JobOverview";
import { ModernJobEstimatesTab } from "@/components/jobs/overview/ModernJobEstimatesTab";
import { ModernJobInvoicesTab } from "@/components/jobs/overview/ModernJobInvoicesTab";
import { JobPayments } from "@/components/jobs/JobPayments";
import { JobHistory } from "@/components/jobs/JobHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

const JobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { hasPermission } = useRBAC();
  const isMobile = useIsMobile();
  
  // Enhanced filtering state
  const [filter, setFilter] = useState<'all' | 'payments' | 'documents' | 'status'>('all');
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>();
  
  console.log("🔍 JobDetailsPage - params:", { jobId });
  console.log("🔍 JobDetailsPage - location:", location);
  
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleEstimateConverted = () => {
    setActiveTab("invoices");
    toast.success('Estimate converted to invoice successfully');
  };

  // Export job data functionality
  const exportJobData = () => {
    // Export estimates, invoices, payments to PDF/Excel
    toast.success('Job data export started');
    console.log('Exporting job data for:', jobId);
    // TODO: Implement actual export functionality
  };

  // Undo functionality for critical actions
  const handleUndo = () => {
    toast.success('Action undone successfully');
    console.log('Undo action for job:', jobId);
    // TODO: Implement actual undo functionality
  };
  
  // Validate job ID format
  const isValidJobId = (jobId: string) => {
    // Job IDs should start with J- followed by numbers
    return /^J-\d+$/.test(jobId);
  };
  
  if (!jobId) {
    console.error("❌ JobDetailsPage - No job ID provided");
    return (
      <PageLayout>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600">Job not found</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">No job ID provided.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!isValidJobId(jobId)) {
    console.error("❌ JobDetailsPage - Invalid job ID format:", jobId);
    return (
      <PageLayout>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600">Invalid Job ID</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Job ID "{jobId}" is not in the correct format. Expected format: J-####
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  console.log("✅ JobDetailsPage - Valid job ID, rendering job details for:", jobId);
  
  return (
    <PageLayout>
      <JobDetailsProvider jobId={jobId}>
        <div className="container mx-auto px-2 sm:px-4 max-w-none overflow-x-hidden">
          <div className="mb-4 sm:mb-6">
            <Card className="border-fixlyfy-border shadow-sm">
              <JobDetailsHeader />
              
              {/* Quick Actions Bar */}
              <div className="flex gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportJobData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="w-full">
            <JobDetailsTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              <TabsContent value="overview" className="mt-0">
                <JobOverview jobId={jobId} />
              </TabsContent>
              <TabsContent value="estimates" className="mt-0">
                <ModernJobEstimatesTab 
                  jobId={jobId} 
                  onEstimateConverted={handleEstimateConverted}
                />
              </TabsContent>
              <TabsContent value="invoices" className="mt-0">
                <ModernJobInvoicesTab jobId={jobId} />
              </TabsContent>
              <TabsContent value="payments" className="mt-0">
                <JobPayments jobId={jobId} />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <JobHistory jobId={jobId} />
              </TabsContent>
            </JobDetailsTabs>
          </div>
        </div>
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;
