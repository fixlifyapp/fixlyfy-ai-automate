
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { UnifiedDocumentBuilder } from "./dialogs/UnifiedDocumentBuilder";
import { useJobs } from "@/hooks/useJobs";
import { useEstimates } from "@/hooks/useEstimates";
import { toast } from "sonner";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { jobs } = useJobs();
  const { refreshEstimates } = useEstimates(jobId);
  
  const job = jobs.find(j => j.id === jobId);

  const handleCreateEstimate = () => {
    console.log('Creating new estimate for job:', jobId);
    setShowCreateForm(true);
  };

  const handleEstimateCreated = () => {
    console.log('Estimate created, refreshing list');
    setShowCreateForm(false);
    refreshEstimates();
    if (onEstimateConverted) {
      onEstimateConverted();
    }
    toast.success('Estimate created successfully!');
  };

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <>
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
        </CardContent>
      </Card>

      {/* Unified Document Builder for creating estimates */}
      <UnifiedDocumentBuilder
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        documentType="estimate"
        jobId={jobId}
        onDocumentCreated={handleEstimateCreated}
      />
    </>
  );
};
