
import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { JobDetails } from "@/components/jobs/JobDetails";
import { JobHistory } from "@/components/jobs/JobHistory";
import { Card } from "@/components/ui/card";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { TabsContent } from "@/components/ui/tabs";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("details");

  return (
    <PageLayout>
      <div className="container mx-auto">
        <div className="mb-6">
          <Card className="border-fixlyfy-border shadow-sm">
            <JobDetailsHeader />
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <JobDetailsTabs activeTab={activeTab} onTabChange={setActiveTab}>
              <TabsContent value="details">
                <JobDetails jobId={id || ""} />
              </TabsContent>
              <TabsContent value="history">
                <JobHistory jobId={id || ""} />
              </TabsContent>
            </JobDetailsTabs>
          </div>
          <div className="md:col-span-1">
            <JobDetailsQuickActions />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default JobDetailsPage;
