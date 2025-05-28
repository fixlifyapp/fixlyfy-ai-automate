
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Send, Trash2, DollarSign, Edit } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "./hooks/useEstimateActions";
import { EstimateBuilderDialog } from "../dialogs/estimate-builder/EstimateBuilderDialog";
import { format } from "date-fns";

interface EstimatesListProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const EstimatesList = ({ jobId, onEstimateConverted }: EstimatesListProps) => {
  const { estimates, setEstimates, isLoading, refreshEstimates } = useEstimates(jobId);
  const { state, actions } = useEstimateActions(jobId, estimates, setEstimates, refreshEstimates, onEstimateConverted);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'converted': 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleEditEstimate = (estimate: any) => {
    setEditingEstimate(estimate);
    setShowCreateForm(true);
  };

  const handleCreateNew = () => {
    setEditingEstimate(null);
    setShowCreateForm(true);
  };

  const handleDialogClose = () => {
    setShowCreateForm(false);
    setEditingEstimate(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estimates ({estimates.length})
            </CardTitle>
            <Button onClick={handleCreateNew}>
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
                      {getStatusBadge(estimate.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}</p>
                      {estimate.notes && <p>Notes: {estimate.notes}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEstimate(estimate)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    {estimate.status !== 'converted' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actions.handleSendEstimate(estimate.id)}
                          disabled={state.isSending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            actions.setSelectedEstimate(estimate);
                            actions.confirmConvertToInvoice();
                          }}
                          disabled={state.isConverting}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Convert
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        actions.setSelectedEstimate(estimate);
                        actions.confirmDeleteEstimate();
                      }}
                      disabled={state.isDeleting}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EstimateBuilderDialog
        open={showCreateForm}
        onOpenChange={handleDialogClose}
        jobId={jobId}
        estimateId={editingEstimate?.id}
        onSyncToInvoice={onEstimateConverted}
      />
    </>
  );
};
