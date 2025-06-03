
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { SimpleEstimateBuilder } from "./dialogs/SimpleEstimateBuilder";
import { EstimatePreviewWindow } from "./dialogs/EstimatePreviewWindow";
import { useJobs } from "@/hooks/useJobs";
import { useEstimates, Estimate } from "@/hooks/useEstimates";
import { toast } from "sonner";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  
  const { jobs } = useJobs();
  const { convertEstimateToInvoice } = useEstimates(jobId);
  
  const job = jobs.find(j => j.id === jobId);

  const handleCreateEstimate = () => {
    setShowCreateForm(true);
  };

  const handleEstimateCreated = () => {
    setShowCreateForm(false);
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setShowPreview(true);
  };

  const handleConvertToInvoice = async (estimate: Estimate) => {
    const success = await convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
      toast.success("Estimate converted to invoice!");
    }
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
            onViewEstimate={handleViewEstimate}
          />
        </CardContent>
      </Card>

      <SimpleEstimateBuilder
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        jobId={jobId}
        clientInfo={job?.client}
        onEstimateCreated={handleEstimateCreated}
      />

      {selectedEstimate && (
        <EstimatePreviewWindow
          open={showPreview}
          onOpenChange={setShowPreview}
          estimate={selectedEstimate}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}
    </>
  );
};
