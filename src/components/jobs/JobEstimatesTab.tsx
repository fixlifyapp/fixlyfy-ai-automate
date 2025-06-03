
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { UnifiedDocumentBuilder } from "./dialogs/UnifiedDocumentBuilder";
import { useJobs } from "@/hooks/useJobs";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { jobs } = useJobs();
  
  const job = jobs.find(j => j.id === jobId);

  const handleCreateEstimate = () => {
    setShowCreateForm(true);
  };

  const handleEstimateCreated = () => {
    setShowCreateForm(false);
    // The EstimatesList component will automatically refresh via useEstimates hook
  };

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button className="gap-2" onClick={handleCreateEstimate}>
            <Plus size={16} />
            Create Estimate
          </Button>
        </div>

        <EstimatesList
          jobId={jobId}
          onEstimateConverted={onEstimateConverted}
        />

        <UnifiedDocumentBuilder
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          documentType="estimate"
          jobId={jobId}
          clientInfo={job?.client}
          onDocumentCreated={handleEstimateCreated}
        />
      </CardContent>
    </Card>
  );
};
