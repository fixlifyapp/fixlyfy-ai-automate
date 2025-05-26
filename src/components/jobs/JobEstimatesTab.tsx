
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { useEstimates } from "@/hooks/useEstimates";
import { UnifiedDocumentBuilder } from "./dialogs/UnifiedDocumentBuilder";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const { estimates, isLoading, setEstimates } = useEstimates(jobId);
  const [isDocumentBuilderOpen, setIsDocumentBuilderOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);

  const handleCreateEstimate = () => {
    setSelectedEstimate(null);
    setIsDocumentBuilderOpen(true);
  };

  const handleEditEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsDocumentBuilderOpen(true);
  };

  const handleEstimateCreated = (estimate: any) => {
    if (selectedEstimate) {
      // Update existing estimate
      setEstimates(estimates.map(est => est.id === estimate.id ? estimate : est));
    } else {
      // Add new estimate
      setEstimates([...estimates, estimate]);
    }
  };

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
          estimates={estimates}
          isLoading={isLoading}
          onEdit={handleEditEstimate}
          onConvert={() => {}}
          onAddWarranty={() => {}}
          onSend={() => {}}
          onDelete={() => {}}
        />

        <UnifiedDocumentBuilder
          open={isDocumentBuilderOpen}
          onOpenChange={setIsDocumentBuilderOpen}
          documentType="estimate"
          existingDocument={selectedEstimate}
          jobId={jobId}
          onDocumentCreated={handleEstimateCreated}
          onSyncToInvoice={onEstimateConverted}
        />
      </CardContent>
    </Card>
  );
};
