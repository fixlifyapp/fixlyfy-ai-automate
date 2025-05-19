
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { JobDetails } from "@/components/jobs/JobDetails";
import { JobHistory } from "@/components/jobs/JobHistory";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { TabsContent } from "@/components/ui/tabs";
import { JobEstimates } from "@/components/jobs/JobEstimates";
import { JobMessages } from "@/components/jobs/JobMessages";
import { JobPayments } from "@/components/jobs/JobPayments";
import { JobInvoices } from "@/components/jobs/JobInvoices";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useJobDetailsHeader } from "@/components/jobs/header/useJobDetailsHeader";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("details");
  const { hasPermission } = useRBAC();
  const jobHeaderData = useJobDetailsHeader(id || "");
  
  // Add function to handle switching to invoices tab when an estimate is converted
  const handleSwitchToInvoicesTab = () => {
    setActiveTab("invoices");
  };
  
  return (
    <PageLayout>
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
              <TabsContent value="details">
                <JobDetails jobId={id || ""} />
              </TabsContent>
              <TabsContent value="estimates">
                <JobEstimates 
                  jobId={id || ""} 
                  onEstimateConverted={handleSwitchToInvoicesTab}
                />
              </TabsContent>
              <TabsContent value="invoices">
                <JobInvoices jobId={id || ""} />
              </TabsContent>
              <TabsContent value="payments">
                <JobPayments jobId={id || ""} />
              </TabsContent>
              <TabsContent value="messages">
                <JobMessages jobId={id || ""} />
              </TabsContent>
              <TabsContent value="history">
                <JobHistory jobId={id || ""} />
              </TabsContent>
            </JobDetailsTabs>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <JobDetailsQuickActions />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default JobDetailsPage;
