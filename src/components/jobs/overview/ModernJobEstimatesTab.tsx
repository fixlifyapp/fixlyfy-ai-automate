
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Edit, Eye, FileText, Trash2, ArrowRight } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { UnifiedDocumentBuilder } from "../dialogs/UnifiedDocumentBuilder";
import { UniversalSendDialog } from "../dialogs/shared/UniversalSendDialog";
import { UnifiedDocumentViewer } from "../dialogs/UnifiedDocumentViewer";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobData } from "../dialogs/unified/hooks/useJobData";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const ModernJobEstimatesTab = ({ jobId, onEstimateConverted }: ModernJobEstimatesTabProps) => {
  const { estimates, isLoading, refreshEstimates } = useEstimates(jobId);
  const { clientInfo, loading: jobDataLoading } = useJobData(jobId);
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const handleCreateEstimate = () => {
    setSelectedEstimate(null);
    setShowEstimateBuilder(true);
  };

  const handleEditEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowEstimateBuilder(true);
  };

  const handleSendEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowSendDialog(true);
  };

  const handleViewEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowPreviewWindow(true);
  };

  const handleConvertEstimate = (estimate: any) => {
    if (onEstimateConverted) {
      onEstimateConverted();
    }
    toast.success('Estimate converted to invoice successfully');
  };

  const handleRemoveEstimate = async (estimate: any) => {
    if (!confirm(`Are you sure you want to delete estimate ${estimate.estimate_number}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', estimate.id);

      if (error) {
        console.error('Error deleting estimate:', error);
        toast.error('Failed to delete estimate');
        return;
      }

      refreshEstimates();
      toast.success('Estimate deleted successfully');
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast.error('Failed to delete estimate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    setSelectedEstimate(null);
    refreshEstimates();
    toast.success("Estimate sent successfully!");
  };

  const handleSendCancel = () => {
    setShowSendDialog(false);
    setSelectedEstimate(null);
  };

  const handleViewerClosed = () => {
    setShowPreviewWindow(false);
    setSelectedEstimate(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      sent: { label: "Sent", variant: "default" as const },
      approved: { label: "Approved", variant: "success" as const },
      declined: { label: "Declined", variant: "destructive" as const },
      expired: { label: "Expired", variant: "secondary" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-2 sm:px-0">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-fixlyfy-border">
            <CardContent className="p-3 sm:p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalEstimateValue = estimates?.reduce((sum, estimate) => sum + (estimate.total || 0), 0) || 0;
  const pendingApproval = estimates?.filter(est => est.status === 'sent').length || 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Estimates</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{estimates?.length || 0}</div>
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
              Estimates ({estimates?.length || 0})
            </CardTitle>
            <Button 
              onClick={handleCreateEstimate}
              className={`w-full sm:w-auto ${isMobile ? 'h-11 text-sm' : ''}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Estimate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          {(!estimates || estimates.length === 0) ? (
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
                          {formatCurrency(estimate.total)}
                        </span>
                        {getStatusBadge(estimate.status)}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        <p>Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}</p>
                        {estimate.valid_until && <p>Valid until: {format(new Date(estimate.valid_until), 'MMM dd, yyyy')}</p>}
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
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>

                    {estimate.status === 'approved' && (
                      <Button
                        size={isMobile ? "default" : "sm"}
                        className={`${isMobile ? 'w-full h-11 justify-start' : ''} bg-green-600 hover:bg-green-700`}
                        onClick={() => handleConvertEstimate(estimate)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Convert to Invoice
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      className={`${isMobile ? 'w-full h-11 justify-start' : ''} text-red-600 hover:text-red-700 border-red-200 hover:border-red-300`}
                      onClick={() => handleRemoveEstimate(estimate)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Remove"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UnifiedDocumentBuilder
        open={showEstimateBuilder}
        onOpenChange={setShowEstimateBuilder}
        documentType="estimate"
        jobId={jobId}
        existingDocument={selectedEstimate}
        onDocumentCreated={refreshEstimates}
      />

      {selectedEstimate && (
        <>
          <UniversalSendDialog
            isOpen={showSendDialog}
            onClose={handleSendCancel}
            documentType="estimate"
            documentId={selectedEstimate.id}
            documentNumber={selectedEstimate.estimate_number}
            total={selectedEstimate.total || 0}
            contactInfo={{
              name: clientInfo?.name || 'Client',
              email: clientInfo?.email || '',
              phone: clientInfo?.phone || ''
            }}
            onSuccess={handleSendSuccess}
          />

          <UnifiedDocumentViewer
            open={showPreviewWindow}
            onOpenChange={handleViewerClosed}
            document={selectedEstimate}
            documentType="estimate"
            jobId={jobId}
            onConvertToInvoice={handleConvertEstimate}
            onDocumentUpdated={refreshEstimates}
          />
        </>
      )}
    </div>
  );
};
