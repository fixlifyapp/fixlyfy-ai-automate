
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
import { ModernJobHistoryTab } from "@/components/jobs/overview/ModernJobHistoryTab";
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
  
  return (
    <PageLayout>
      {/* Remove the dynamic key that was causing re-mounting */}
      <JobDetailsProvider jobId={id || ""}>
        <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-4'}`}>
          <div className={`mb-6 ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <Card className={`border-fixlyfy-border shadow-sm ${isMobile ? 'mx-1' : ''}`}>
              <JobDetailsHeader />
            </Card>
          </div>
          
          <div className={`w-full ${isMobile ? 'px-1' : ''}`}>
            <JobDetailsTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              <TabsContent value="overview">
                <JobOverview jobId={id || ""} />
              </TabsContent>
              <TabsContent value="estimates">
                <ModernJobEstimatesTab 
                  jobId={id || ""} 
                  onEstimateConverted={handleEstimateConverted}
                />
              </TabsContent>
              <TabsContent value="invoices">
                <ModernJobInvoicesTab jobId={id || ""} />
              </TabsContent>
              <TabsContent value="payments">
                <ModernJobPaymentsTab jobId={id || ""} />
              </TabsContent>
              <TabsContent value="history">
                <ModernJobHistoryTab jobId={id || ""} />
              </TabsContent>
            </JobDetailsTabs>
          </div>
        </div>
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;
