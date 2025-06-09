import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Send, FileText, DollarSign, Trash2, ArrowRight } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "../estimates/hooks/useEstimateActions";
import { UnifiedDocumentBuilder } from "../dialogs/UnifiedDocumentBuilder";
import { UnifiedDocumentPreview } from "../dialogs/unified/UnifiedDocumentPreview";
import { EstimateSendDialog } from "../dialogs/estimate-builder/EstimateSendDialog";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const ModernJobEstimatesTab = ({ jobId, onEstimateConverted }: ModernJobEstimatesTabProps) => {
  const { estimates, isLoading, refreshEstimates } = useEstimates(jobId);
  const { state, actions } = useEstimateActions(
    jobId,
    estimates,
    () => {}, // setEstimates not needed with new hook structure
    refreshEstimates,
    onEstimateConverted
  );

  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);

  const handleCreateEstimate = () => {
    setShowEstimateBuilder(true);
  };

  const handlePreviewEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowPreview(true);
  };

  const handleSendEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowSendDialog(true);
  };

  const handleConvertToInvoice = (estimate: any) => {
    actions.setSelectedEstimate(estimate);
    actions.confirmConvertToInvoice();
  };

  const handleDeleteEstimate = (estimate: any) => {
    actions.setSelectedEstimate(estimate);
    actions.confirmDeleteEstimate();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Estimates</h3>
          <p className="text-sm text-muted-foreground">
            {estimates.length} estimate{estimates.length !== 1 ? 's' : ''} for this job
          </p>
        </div>
        <Button onClick={handleCreateEstimate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Estimate
        </Button>
      </div>

      {estimates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No estimates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first estimate to get started with this job.
            </p>
            <Button onClick={handleCreateEstimate}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Estimate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {estimates.map((estimate) => (
            <Card key={estimate.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{estimate.estimate_number}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(estimate.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${estimate.total.toFixed(2)}
                    </div>
                    {estimate.status === 'sent' && estimate.valid_until && (
                      <div className="text-sm text-muted-foreground">
                        Valid until {new Date(estimate.valid_until).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {estimate.description && (
                  <p className="text-sm text-muted-foreground mb-4">{estimate.description}</p>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreviewEstimate(estimate)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  
                  {estimate.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendEstimate(estimate)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  )}
                  
                  {estimate.status === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConvertToInvoice(estimate)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Convert to Invoice
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteEstimate(estimate)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UnifiedDocumentBuilder
        open={showEstimateBuilder}
        onOpenChange={setShowEstimateBuilder}
        documentType="estimate"
        jobId={jobId}
        onDocumentCreated={refreshEstimates}
      />

      {selectedEstimate && (
        <>
          <UnifiedDocumentPreview
            documentType="estimate"
            documentNumber={selectedEstimate.estimate_number}
            lineItems={selectedEstimate.items || []}
            calculateSubtotal={() => selectedEstimate.subtotal || 0}
            calculateTotalTax={() => selectedEstimate.tax_amount || 0}
            calculateGrandTotal={() => selectedEstimate.total || 0}
            notes={selectedEstimate.notes || ''}
            issueDate={selectedEstimate.created_at}
            dueDate={selectedEstimate.valid_until || ''}
          />

          <EstimateSendDialog
            open={showSendDialog}
            onClose={() => setShowSendDialog(false)}
            estimateId={selectedEstimate.id}
            estimateNumber={selectedEstimate.estimate_number}
            total={selectedEstimate.total}
            contactInfo={{
              name: 'Client Name',
              email: 'client@example.com',
              phone: '(555) 123-4567'
            }}
            onSuccess={() => {
              setShowSendDialog(false);
              refreshEstimates();
            }}
          />
        </>
      )}
    </div>
  );
};
