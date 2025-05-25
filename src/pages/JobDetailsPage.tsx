
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { TabsContent } from "@/components/ui/tabs";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { toast } from "sonner";
import { JobDetailsProvider } from "@/components/jobs/context/JobDetailsContext";
import { JobOverview } from "@/components/jobs/JobOverview";
import { ModernJobEstimatesTab } from "@/components/jobs/overview/ModernJobEstimatesTab";
import { ModernJobInvoicesTab } from "@/components/jobs/overview/ModernJobInvoicesTab";
import { ModernJobPaymentsTab } from "@/components/jobs/overview/ModernJobPaymentsTab";
import { ModernJobHistoryTab } from "@/components/jobs/overview/ModernJobHistoryTab";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { hasPermission } = useRBAC();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  useUnifiedRealtime({
    tables: ['jobs', 'invoices', 'payments', 'estimates', 'messages', 'job_history', 'clients', 'job_custom_field_values', 'job_attachments'],
    onUpdate: () => {
      console.log("Unified realtime update triggered for job details");
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: !!id
  });
  
  const handleEstimateConverted = () => {
    setActiveTab("invoices");
  };
  
  return (
    <PageLayout>
      <JobDetailsProvider jobId={id || ""}>
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Card className="border-fixlyfy-border shadow-sm">
              <JobDetailsHeader />
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <JobDetailsTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              >
                <TabsContent value="overview">
                  <JobOverview jobId={id || ""} />
                </TabsContent>
                <TabsContent value="estimates">
                  <ModernJobEstimatesTab jobId={id || ""} onEstimateConverted={handleEstimateConverted} />
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
            <div className="lg:col-span-1 space-y-6">
              <JobDetailsQuickActions jobId={id || ""} />
            </div>
          </div>
        </div>
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;
