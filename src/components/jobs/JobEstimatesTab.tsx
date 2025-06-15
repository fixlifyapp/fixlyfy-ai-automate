
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { UnifiedDocumentBuilder } from "./dialogs/UnifiedDocumentBuilder";
import { UnifiedDocumentViewer } from "./dialogs/UnifiedDocumentViewer";
import { useJobs } from "@/hooks/useJobs";
import { useEstimates, Estimate } from "@/hooks/useEstimates";
import { toast } from "sonner";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  
  const { jobs } = useJobs();
  const { convertEstimateToInvoice, refreshEstimates } = useEstimates(jobId);
  
  const job = jobs.find(j => j.id === jobId);

  const handleCreateEstimate = () => {
    console.log('Creating new estimate for job:', jobId);
    setShowCreateForm(true);
  };

  const handleEstimateCreated = (estimate?: Estimate) => {
    console.log('Estimate created, refreshing list');
    setShowCreateForm(false);
    refreshEstimates();
    if (onEstimateConverted) {
      onEstimateConverted();
    }
    toast.success('Estimate created successfully!');
  };

  const handleViewEstimate = (estimate: Estimate) => {
    console.log('Viewing estimate:', estimate.id);
    setSelectedEstimate(estimate);
    setShowViewer(true);
  };

  const handleConvertToInvoice = async (estimate: Estimate) => {
    console.log('Converting estimate to invoice:', estimate.id);
    const success = await convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
      toast.success("Estimate converted to invoice!");
    }
    setShowViewer(false);
  };

  const handleDocumentUpdated = () => {
    refreshEstimates();
    if (onEstimateConverted) {
      onEstimateConverted();
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
            onEstimateConverted={() => {
              refreshEstimates();
              if (onEstimateConverted) onEstimateConverted();
            }}
            onViewEstimate={handleViewEstimate}
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

      {/* Unified Document Viewer */}
      {selectedEstimate && (
        <UnifiedDocumentViewer
          open={showViewer}
          onOpenChange={setShowViewer}
          document={selectedEstimate}
          documentType="estimate"
          jobId={jobId}
          onConvertToInvoice={handleConvertToInvoice}
          onDocumentUpdated={handleDocumentUpdated}
        />
      )}
    </>
  );
};
