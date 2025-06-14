
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import { ModernJobPaymentsTab } from "@/components/jobs/overview/ModernJobPaymentsTab";
import { JobHistory } from "@/components/jobs/JobHistory";
import { useIsMobile } from "@/hooks/use-mobile";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { hasPermission } = useRBAC();
  const isMobile = useIsMobile();
  
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
  
  if (!id) {
    return (
      <PageLayout>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-red-600">Job not found</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Invalid job ID provided.</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <JobDetailsProvider jobId={id}>
        <div className="container mx-auto px-2 sm:px-4 max-w-none overflow-x-hidden">
          <div className="mb-4 sm:mb-6">
            <Card className="border-fixlyfy-border shadow-sm">
              <JobDetailsHeader />
            </Card>
          </div>
          
          <div className="w-full">
            <JobDetailsTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              <TabsContent value="overview" className="mt-0">
                <JobOverview jobId={id} />
              </TabsContent>
              <TabsContent value="estimates" className="mt-0">
                <ModernJobEstimatesTab 
                  jobId={id} 
                  onEstimateConverted={handleEstimateConverted}
                />
              </TabsContent>
              <TabsContent value="invoices" className="mt-0">
                <ModernJobInvoicesTab jobId={id} />
              </TabsContent>
              <TabsContent value="payments" className="mt-0">
                <ModernJobPaymentsTab jobId={id} />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <JobHistory jobId={id} />
              </TabsContent>
            </JobDetailsTabs>
          </div>
        </div>
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;
