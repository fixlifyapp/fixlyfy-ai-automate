
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Send, DollarSign, Eye } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { SteppedEstimateBuilder } from "../dialogs/SteppedEstimateBuilder";
import { EstimateSendDialog } from "../dialogs/estimate-builder/EstimateSendDialog";
import { formatCurrency } from "@/lib/utils";
import { Estimate } from "@/hooks/useEstimates";

interface EstimatesListProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const EstimatesList = ({ jobId, onEstimateConverted }: EstimatesListProps) => {
  const { estimates, isLoading, convertEstimateToInvoice } = useEstimates(jobId);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [sendingEstimate, setSendingEstimate] = useState<Estimate | null>(null);

  const handleEdit = (estimate: Estimate) => {
    setEditingEstimate(estimate);
  };

  const handleSend = (estimate: Estimate) => {
    setSendingEstimate(estimate);
  };

  const handleConvert = async (estimate: Estimate) => {
    const success = await convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading estimates...</div>;
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg mb-2">No estimates yet</div>
        <div className="text-sm">Create your first estimate to get started</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {estimates.map((estimate) => (
          <Card key={estimate.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {estimate.estimate_number || estimate.number}
                  </CardTitle>
                  <Badge className={getStatusColor(estimate.status)}>
                    {estimate.status || 'draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(estimate.total || estimate.amount || 0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(estimate.date || estimate.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(estimate)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSend(estimate)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                      {estimate.status !== 'converted' && (
                        <DropdownMenuItem onClick={() => handleConvert(estimate)}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Convert to Invoice
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            {estimate.notes && (
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {estimate.notes}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Estimate Dialog */}
      <SteppedEstimateBuilder
        open={!!editingEstimate}
        onOpenChange={(open) => !open && setEditingEstimate(null)}
        jobId={jobId}
        existingEstimate={editingEstimate || undefined}
        onEstimateCreated={() => setEditingEstimate(null)}
      />

      {/* Send Estimate Dialog */}
      <EstimateSendDialog
        open={!!sendingEstimate}
        onOpenChange={(open) => !open && setSendingEstimate(null)}
        estimateNumber={sendingEstimate?.estimate_number || sendingEstimate?.number || ''}
        jobId={jobId}
        onSuccess={() => setSendingEstimate(null)}
        onCancel={() => setSendingEstimate(null)}
        onSave={async () => true}
      />
    </>
  );
};
