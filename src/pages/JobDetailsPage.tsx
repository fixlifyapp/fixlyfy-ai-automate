
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { JobDetails } from "@/components/jobs/JobDetails";
import { JobHistory } from "@/components/jobs/JobHistory";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { TabsContent } from "@/components/ui/tabs";
import { JobPayments } from "@/components/jobs/JobPayments";
import { useRBAC } from "@/components/auth/RBACProvider";
import { JobEstimatesTab } from "@/components/jobs/JobEstimatesTab";
import { JobInvoices } from "@/components/jobs/JobInvoices";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { toast } from "sonner";
import { JobDetailsProvider } from "@/components/jobs/context/JobDetailsContext";
import { JobCustomFieldsDisplay } from "@/components/jobs/JobCustomFieldsDisplay";
import { JobOverview } from "@/components/jobs/JobOverview";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { hasPermission } = useRBAC();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Check for activeTab in location state when component mounts or location changes
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      
      // Clear the state to prevent persistent tab selection on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Handle unified realtime updates for this job and all related data
  useUnifiedRealtime({
    tables: ['jobs', 'invoices', 'payments', 'estimates', 'messages', 'jobHistory', 'clients', 'job_custom_field_values'],
    onUpdate: () => {
      console.log("Unified realtime update triggered for job details");
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: !!id
  });
  
  // Handle estimate conversion
  const handleEstimateConverted = () => {
    // Switch to invoices tab
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
                  <JobEstimatesTab jobId={id || ""} onEstimateConverted={handleEstimateConverted} />
                </TabsContent>
                <TabsContent value="invoices">
                  <JobInvoices jobId={id || ""} />
                </TabsContent>
                <TabsContent value="payments">
                  <JobPayments jobId={id || ""} />
                </TabsContent>
                <TabsContent value="history">
                  <JobHistory jobId={id || ""} />
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
