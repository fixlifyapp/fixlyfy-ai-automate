
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EstimatesList } from "./estimates/EstimatesList";
import { useEstimates } from "@/hooks/useEstimates";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { ConvertToInvoiceDialog } from "./estimates/dialogs/ConvertToInvoiceDialog";
import { UpsellDialog } from "./dialogs/UpsellDialog";
import { EstimateBuilderDialog } from "./dialogs/estimate-builder/EstimateBuilderDialog";
import { WarrantySelectionDialog } from "./dialogs/WarrantySelectionDialog";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const { estimates, isLoading, setEstimates } = useEstimates(jobId);
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);

  const handleCreateEstimate = () => {
    setSelectedEstimateId(null);
    setIsEstimateBuilderOpen(true);
  };

  const handleEditEstimate = (estimateId: string) => {
    setSelectedEstimateId(estimateId);
    setIsEstimateBuilderOpen(true);
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

        <EstimateBuilderDialog
          open={isEstimateBuilderOpen}
          onOpenChange={setIsEstimateBuilderOpen}
          estimateId={selectedEstimateId}
          jobId={jobId}
          onSyncToInvoice={onEstimateConverted}
        />
      </CardContent>
    </Card>
  );
};
