
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowRight } from "lucide-react";
import { Estimate, useEstimates } from "@/hooks/useEstimates";
import { EstimateDialog } from "./dialogs/EstimateDialog";
import { EstimatesList } from "./estimates/EstimatesList";
import { ConvertToInvoiceDialog } from "./estimates/dialogs/ConvertToInvoiceDialog";
import { toast } from "sonner";
import { recordEstimateCreated, recordEstimateConverted } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const { estimates, isLoading, error } = useEstimates(jobId, onEstimateConverted);
  const { currentUser } = useRBAC();
  
  const handleNewEstimateClick = () => {
    setIsDialogOpen(true);
  };
  
  const handleConvertClick = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsConvertDialogOpen(true);
  };
  
  const handleEstimateCreated = (estimateNumber: string, amount: number) => {
    // Record in job history
    recordEstimateCreated(
      jobId,
      estimateNumber,
      amount,
      currentUser?.name,
      currentUser?.id
    );
    toast.success("Estimate created successfully!");
  };
  
  const handleEstimateConverted = (estimateId: string, estimateNumber: string, invoiceId: string, invoiceNumber: string, amount: number) => {
    // Record in job history
    recordEstimateConverted(
      jobId,
      estimateNumber,
      invoiceNumber,
      amount,
      currentUser?.name,
      currentUser?.id
    );
    
    toast.success("Estimate converted to invoice successfully!");
    if (onEstimateConverted) {
      onEstimateConverted();
    }
    setIsConvertDialogOpen(false);
  };
  
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button onClick={handleNewEstimateClick} className="flex items-center gap-2">
            <Plus size={16} />
            New Estimate
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600">Error loading estimates. Please try again.</p>
          </div>
        )}
        
        <EstimatesList 
          estimates={estimates} 
          isLoading={isLoading}
          onConvertClick={handleConvertClick}
        />
      </CardContent>
      
      <EstimateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        jobId={jobId}
        onEstimateCreated={handleEstimateCreated}
      />
      
      {selectedEstimate && (
        <ConvertToInvoiceDialog
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          estimate={selectedEstimate}
          onEstimateConverted={handleEstimateConverted}
        />
      )}
    </Card>
  );
};
