
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <JobDetailsHeader id={id} />
          <JobDetailsTabs />
        </div>
        <div>
          <JobDetailsQuickActions />
        </div>
      </div>
    </PageLayout>
  );
};

export default JobDetailsPage;
