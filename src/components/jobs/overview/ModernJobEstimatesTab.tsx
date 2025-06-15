
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Send, Trash2, Edit, DollarSign, Eye } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "@/components/jobs/estimates/hooks/useEstimateActions";
import { SteppedEstimateBuilder } from "@/components/jobs/dialogs/SteppedEstimateBuilder";
import { UnifiedDocumentViewer } from "@/components/jobs/dialogs/UnifiedDocumentViewer";
import { UniversalSendDialog } from "@/components/jobs/dialogs/shared/UniversalSendDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobData } from "../dialogs/unified/hooks/useJobData";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
  onTabChange?: (tab: string) => void;
}

export const ModernJobEstimatesTab = ({ 
  jobId, 
  onEstimateConverted, 
  onTabChange 
}: ModernJobEstimatesTabProps) => {
  const { estimates, setEstimates, isLoading, refreshEstimates } = useEstimates(jobId);
  const { state, actions } = useEstimateActions(jobId, estimates, setEstimates, refreshEstimates, onEstimateConverted);
  const { clientInfo, loading: jobDataLoading } = useJobData(jobId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingEstimate, setSendingEstimate] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const isMobile = useIsMobile();

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

  const totalEstimateValue = estimates.reduce((sum, estimate) => sum + (estimate.total || 0), 0);
  const pendingApproval = estimates.filter(est => est.status === 'sent').length;

  const handleEstimateCreated = () => {
    refreshEstimates();
    setShowCreateForm(false);
    setEditingEstimate(null);
  };

  const handleEditEstimate = (estimate: any) => {
    console.log('Setting estimate for editing:', estimate);
    setEditingEstimate(estimate);
    setShowCreateForm(true);
  };

  const handleViewEstimate = (estimate: any) => {
    console.log('Setting estimate for preview:', estimate);
    setPreviewEstimate(estimate);
    setShowPreview(true);
  };

  const handleCreateNew = () => {
    setEditingEstimate(null);
    setShowCreateForm(true);
  };

  const handleDialogClose = () => {
    setShowCreateForm(false);
    setEditingEstimate(null);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewEstimate(null);
  };

  const handleDeleteEstimate = async (estimate: any) => {
    console.log('Deleting estimate:', estimate);
    actions.setSelectedEstimate(estimate);
    await actions.confirmDeleteEstimate();
  };

  const handleSendEstimate = (estimate: any) => {
    console.log('Sending estimate:', estimate);
    setSendingEstimate(estimate);
    setShowSendDialog(true);
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    setSendingEstimate(null);
    refreshEstimates();
    toast.success("Estimate sent successfully!");
  };

  const handleSendCancel = () => {
    setShowSendDialog(false);
    setSendingEstimate(null);
  };

  const handleConvertEstimate = async (estimate: any) => {
    if (!estimate) return;
    
    console.log('Converting estimate to invoice:', estimate.id);
    setIsConverting(true);
    
    try {
      actions.setSelectedEstimate(estimate);
      const success = await actions.confirmConvertToInvoice();
      
      if (success) {
        console.log('Estimate converted successfully, calling onEstimateConverted');
        toast.success("Estimate converted to invoice successfully!");
        if (onEstimateConverted) {
          onEstimateConverted();
        }
        if (onTabChange) {
          onTabChange('invoices');
        }
      }
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error("Failed to convert estimate to invoice");
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertToInvoice = async (estimate: any) => {
    const success = await actions.convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
    }
    setShowPreview(false);
    if (onTabChange) {
      onTabChange('invoices');
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-fixlyfy-border shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Estimates</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{estimates.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-fixlyfy-border shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 break-all">{formatCurrency(totalEstimateValue)}</div>
            </CardContent>
          </Card>
          
          <Card className="border-fixlyfy-border shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{pendingApproval}</div>
            </CardContent>
          </Card>
        </div>

        {/* Estimates List */}
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Estimates ({estimates.length})
              </CardTitle>
              <Button 
                onClick={handleCreateNew}
                className={`w-full sm:w-auto ${isMobile ? 'h-11 text-sm' : ''}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading estimates...</p>
              </div>
            ) : estimates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No estimates yet</p>
                <p className="text-sm">Create your first estimate to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {estimates.map((estimate) => (
                  <div key={estimate.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <span className="font-medium text-sm sm:text-base break-all">{estimate.estimate_number}</span>
                          <span className="text-lg sm:text-xl font-semibold text-blue-600 break-all">
                            {formatCurrency(estimate.total || 0)}
                          </span>
                          {getStatusBadge(estimate.status)}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                          <p>Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}</p>
                          {estimate.notes && <p className="break-words">Notes: {estimate.notes}</p>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}>
                      <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
                        onClick={() => handleViewEstimate(estimate)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
                        onClick={() => handleEditEstimate(estimate)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''}`}
                        onClick={() => handleSendEstimate(estimate)}
                        disabled={state.isSending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      
                      {estimate.status !== 'converted' && (
                        <Button
                          variant="outline"
                          size={isMobile ? "default" : "sm"}
                          className={`${isMobile ? 'w-full h-11 justify-start' : ''} text-green-600 hover:text-green-700 border-green-200 hover:border-green-300`}
                          onClick={() => handleConvertEstimate(estimate)}
                          disabled={isConverting}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {isConverting ? "Converting..." : "Convert"}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''} text-red-600 hover:text-red-700 border-red-200 hover:border-red-300`}
                        onClick={() => handleDeleteEstimate(estimate)}
                        disabled={state.isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <SteppedEstimateBuilder
        open={showCreateForm}
        onOpenChange={handleDialogClose}
        jobId={jobId}
        existingEstimate={editingEstimate}
        onEstimateCreated={handleEstimateCreated}
      />

      {/* Unified Document Viewer for Estimates */}
      {previewEstimate && (
        <UnifiedDocumentViewer
          open={showPreview}
          onOpenChange={handlePreviewClose}
          document={previewEstimate}
          documentType="estimate"
          jobId={jobId}
          onConvertToInvoice={handleConvertToInvoice}
          onDocumentUpdated={refreshEstimates}
        />
      )}

      {sendingEstimate && (
        <UniversalSendDialog
          isOpen={showSendDialog}
          onClose={handleSendCancel}
          documentType="estimate"
          documentId={sendingEstimate.id}
          documentNumber={sendingEstimate.estimate_number}
          total={sendingEstimate.total || 0}
          contactInfo={{
            name: clientInfo?.name || 'Client',
            email: clientInfo?.email || '',
            phone: clientInfo?.phone || ''
          }}
          onSuccess={handleSendSuccess}
        />
      )}
    </>
  );
};
