
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
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
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Enhanced real-time refresh with more comprehensive table monitoring
  useUnifiedRealtime({
    tables: [
      'jobs', 
      'invoices', 
      'payments', 
      'estimates', 
      'messages', 
      'clients', 
      'job_custom_field_values',
      'line_items', // Added for estimate/invoice line items
      'estimate_communications', // Added for estimate communications
      'invoice_communications', // Added for invoice communications
      'jobHistory' // Fixed: Changed from 'job_history' to 'jobHistory'
    ],
    onUpdate: () => {
      console.log("Real-time update detected");
      const now = Date.now();
      
      // Throttle updates to prevent excessive refreshes (max once per 500ms)
      if (now - lastRefresh > 500) {
        console.log("Triggering unified realtime refresh for job details");
        setRefreshTrigger(prev => prev + 1);
        setLastRefresh(now);
        
        // Show success toast for real-time updates
        toast.success('Data updated successfully');
      }
    },
    enabled: !!id
  });
  
  const handleEstimateConverted = () => {
    setActiveTab("invoices");
    // Force an additional refresh when estimate is converted
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <PageLayout>
      <JobDetailsProvider jobId={id || ""} key={`${id}-${refreshTrigger}`}>
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Card className="border-fixlyfy-border shadow-sm">
              <JobDetailsHeader key={`header-${refreshTrigger}`} />
            </Card>
          </div>
          
          <div className="w-full">
            <JobDetailsTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            >
              <TabsContent value="overview">
                <JobOverview jobId={id || ""} key={`overview-${refreshTrigger}`} />
              </TabsContent>
              <TabsContent value="estimates">
                <ModernJobEstimatesTab 
                  jobId={id || ""} 
                  onEstimateConverted={handleEstimateConverted}
                  key={`estimates-${refreshTrigger}`}
                />
              </TabsContent>
              <TabsContent value="invoices">
                <ModernJobInvoicesTab 
                  jobId={id || ""} 
                  key={`invoices-${refreshTrigger}`}
                />
              </TabsContent>
              <TabsContent value="payments">
                <ModernJobPaymentsTab 
                  jobId={id || ""} 
                  key={`payments-${refreshTrigger}`}
                />
              </TabsContent>
              <TabsContent value="history">
                <ModernJobHistoryTab 
                  jobId={id || ""} 
                  key={`history-${refreshTrigger}`}
                />
              </TabsContent>
            </JobDetailsTabs>
          </div>
        </div>
      </JobDetailsProvider>
    </PageLayout>
  );
};

export default JobDetailsPage;
