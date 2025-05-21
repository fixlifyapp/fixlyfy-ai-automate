
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
import { JobMessages } from "@/components/jobs/JobMessages";
import { JobPayments } from "@/components/jobs/JobPayments";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useJobDetailsHeader } from "@/components/jobs/header/useJobDetailsHeader";
import { JobEstimatesTab } from "@/components/jobs/JobEstimatesTab";
import { JobInvoices } from "@/components/jobs/JobInvoices";
import { supabase } from "@/integrations/supabase/client";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [isJobValid, setIsJobValid] = useState<boolean>(true);
  const { hasPermission } = useRBAC();
  const jobHeaderData = useJobDetailsHeader(id || "");
  
  // Check if the job exists when the component mounts
  useEffect(() => {
    const checkJobExists = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('id')
          .eq('id', id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking job:", error);
        }
        
        setIsJobValid(!!data);
      } catch (err) {
        console.error("Error in checkJobExists:", err);
        setIsJobValid(true); // Assume valid on error to avoid blocking UI
      }
    };
    
    checkJobExists();
  }, [id]);
  
  // Check for activeTab in location state when component mounts or location changes
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      
      // Clear the state to prevent persistent tab selection on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Handle estimate conversion
  const handleEstimateConverted = () => {
    // Switch to invoices tab
    setActiveTab("invoices");
  };
  
  if (!isJobValid) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
            <p>The job you are looking for does not exist or you don't have permission to view it.</p>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
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
                <JobEstimatesTab jobId={id || ""} onEstimateConverted={handleEstimateConverted} />
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
