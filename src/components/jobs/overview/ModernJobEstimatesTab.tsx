
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "../estimates/EstimatesList";
import { UnifiedDocumentBuilder } from "../dialogs/UnifiedDocumentBuilder";
import { EstimatePreviewWindow } from "../dialogs/EstimatePreviewWindow";
import { useJobs } from "@/hooks/useJobs";
import { useEstimates, Estimate } from "@/hooks/useEstimates";
import { toast } from "sonner";

export interface ModernJobEstimatesTabProps {
  jobId: string;
}

export const ModernJobEstimatesTab = ({ jobId }: ModernJobEstimatesTabProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  
  const { jobs } = useJobs();
  const { 
    estimates, 
    convertEstimateToInvoice, 
    refreshEstimates, 
    updateEstimateStatus,
    fetchEstimatesWithJobs 
  } = useEstimates(jobId);
  
  const job = jobs.find(j => j.id === jobId);

  const handleCreateEstimate = () => {
    console.log('Creating new estimate for job:', jobId);
    setShowCreateForm(true);
  };

  const handleEstimateCreated = (estimate?: Estimate) => {
    console.log('Estimate created, refreshing list');
    setShowCreateForm(false);
    refreshEstimates();
    toast.success('Estimate created successfully!');
  };

  const handleViewEstimate = (estimate: Estimate) => {
    console.log('Viewing estimate:', estimate.id);
    setSelectedEstimate(estimate);
    setShowPreview(true);
  };

  const handleConvertToInvoice = async (estimate: Estimate) => {
    console.log('Converting estimate to invoice:', estimate.id);
    const success = await convertEstimateToInvoice(estimate.id);
    if (success) {
      toast.success("Estimate converted to invoice!");
    }
  };

  const handleEstimateConverted = () => {
    refreshEstimates();
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
            onEstimateConverted={handleEstimateConverted}
            onViewEstimate={handleViewEstimate}
          />
        </CardContent>
      </Card>

      {/* Unified Document Builder for creating/editing estimates */}
      <UnifiedDocumentBuilder
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        documentType="estimate"
        jobId={jobId}
        onDocumentCreated={handleEstimateCreated}
      />

      {/* Estimate Preview Window */}
      {selectedEstimate && (
        <EstimatePreviewWindow
          open={showPreview}
          onOpenChange={setShowPreview}
          estimate={selectedEstimate}
          onEstimateConverted={handleEstimateConverted}
        />
      )}
    </>
  );
};
