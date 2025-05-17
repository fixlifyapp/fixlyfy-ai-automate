
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";

const JobDetailsPage = () => {
  const { id } = useParams();
  
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Job Details</h1>
        <p>This page has been reset and is ready to be rebuilt.</p>
        <p className="text-muted-foreground">Job ID: {id}</p>
      </div>
    </PageLayout>
  );
};

export default JobDetailsPage;
