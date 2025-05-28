
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, DollarSign } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "@/components/jobs/estimates/hooks/useEstimateActions";
import { EstimateActions } from "@/components/jobs/estimates/EstimateActions";
import { EstimateBuilderDialog } from "@/components/jobs/dialogs/estimate-builder/EstimateBuilderDialog";
import { format } from "date-fns";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const ModernJobEstimatesTab = ({ jobId, onEstimateConverted }: ModernJobEstimatesTabProps) => {
  const { estimates, setEstimates, isLoading, refreshEstimates } = useEstimates(jobId);
  const { state, actions } = useEstimateActions(jobId, estimates, setEstimates, refreshEstimates, onEstimateConverted);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const totalEstimateValue = estimates.reduce((sum, estimate) => sum + (estimate.total || 0), 0);

  const handleEditEstimate = (estimate: any) => {
    // This would open an estimate editing form/modal
    console.log('Edit estimate:', estimate);
    // TODO: Implement estimate editing
  };

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estimates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalEstimateValue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {estimates.filter(est => est.status === 'sent').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimates List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estimates ({estimates.length})
              </CardTitle>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading estimates...</div>
            ) : estimates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No estimates yet</p>
                <p className="text-sm">Create your first estimate to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {estimates.map((estimate) => (
                  <div key={estimate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{estimate.estimate_number}</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {formatCurrency(estimate.total || 0)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}</p>
                        {estimate.notes && <p>Notes: {estimate.notes}</p>}
                      </div>
                    </div>
                    
                    <EstimateActions
                      estimate={estimate}
                      onSend={actions.handleSendEstimate}
                      onDelete={actions.confirmDeleteEstimate}
                      onConvertToInvoice={actions.confirmConvertToInvoice}
                      onEdit={handleEditEstimate}
                      isLoading={state.isDeleting || state.isConverting || state.isSending}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estimate Builder Dialog */}
      <EstimateBuilderDialog
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        jobId={jobId}
        onSyncToInvoice={onEstimateConverted}
      />
    </>
  );
};
