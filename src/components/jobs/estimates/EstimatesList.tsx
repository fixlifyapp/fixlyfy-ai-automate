
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Copy, CheckCircle } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { Link } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import { UnifiedDocumentBuilder } from "../dialogs/UnifiedDocumentBuilder";

interface EstimatesListProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const EstimatesList = ({ jobId, onEstimateConverted }: EstimatesListProps) => {
  const [editingEstimate, setEditingEstimate] = useState<string | null>(null);
  const { jobs } = useJobs();
  
  const job = jobs.find(j => j.id === jobId);
  const { estimates, isLoading, convertEstimateToInvoice } = useEstimates(jobId);

  const jobEstimates = estimates ? estimates.filter(estimate => estimate.job_id === jobId) : [];

  const handleConvertToInvoice = async (estimateId: string) => {
    if (estimateId) {
      const success = await convertEstimateToInvoice(estimateId);
      if (success) {
        onEstimateConverted?.();
      }
    }
  };

  const handleEdit = (estimateId: string) => {
    setEditingEstimate(estimateId);
  };

  const handleEditClose = () => {
    setEditingEstimate(null);
  };

  const handleEstimateUpdated = () => {
    setEditingEstimate(null);
  };

  // Find the estimate being edited
  const estimateToEdit = editingEstimate ? jobEstimates.find(est => est.id === editingEstimate) : null;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p>Loading estimates...</p>
      ) : jobEstimates.length > 0 ? (
        jobEstimates.map((estimate) => (
          <Card key={estimate.id} className="border-fixlyfy-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{estimate.estimate_number}</h4>
                  <p className="text-sm text-muted-foreground">
                    Total: ${estimate.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {estimate.status}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(estimate.id)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  {estimate.status === 'sent' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConvertToInvoice(estimate.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Convert to Invoice
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No estimates found for this job.</p>
      )}
      
      {editingEstimate && job && estimateToEdit && (
        <UnifiedDocumentBuilder
          open={!!editingEstimate}
          onOpenChange={handleEditClose}
          documentType="estimate"
          existingDocument={estimateToEdit}
          jobId={jobId}
          clientInfo={job.client}
          onDocumentCreated={handleEstimateUpdated}
        />
      )}
    </div>
  );
};
