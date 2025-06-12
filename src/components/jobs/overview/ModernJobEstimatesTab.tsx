
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, Send, Download, Edit2 } from 'lucide-react';
import { SteppedEstimateBuilder } from '../dialogs/SteppedEstimateBuilder';
import { useEstimates } from '@/hooks/useEstimates';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface ModernJobEstimatesTabProps {
  jobId: string;
}

export const ModernJobEstimatesTab = ({ jobId }: ModernJobEstimatesTabProps) => {
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const estimatesHook = useEstimates();

  useEffect(() => {
    fetchJobEstimates();
  }, [jobId]);

  const fetchJobEstimates = async () => {
    setIsLoading(true);
    try {
      const allEstimates = await estimatesHook.fetchEstimatesWithJobs();
      const jobEstimates = allEstimates.filter(est => est.job_id === jobId);
      setEstimates(jobEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstimateCreated = () => {
    setShowEstimateBuilder(false);
    setSelectedEstimate(null);
    fetchJobEstimates(); // Refresh the list
  };

  const handleEditEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowEstimateBuilder(true);
  };

  const handleSendEstimate = async (estimateId: string) => {
    try {
      await estimatesHook.updateEstimateStatus(estimateId, 'sent');
      toast.success('Estimate sent successfully');
      fetchJobEstimates();
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      converted: { label: 'Converted', className: 'bg-purple-100 text-purple-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Estimates
        </h3>
        <Button onClick={() => setShowEstimateBuilder(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Estimate
        </Button>
      </div>

      {estimates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No estimates yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first estimate for this job to get started.
            </p>
            <Button onClick={() => setShowEstimateBuilder(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Estimate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {estimates.map((estimate) => (
            <Card key={estimate.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{estimate.estimate_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {new Date(estimate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {renderStatusBadge(estimate.status)}
                    <div className="text-2xl font-bold mt-2">
                      {formatCurrency(estimate.total)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEstimate(estimate)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEstimate(estimate.id)}
                      disabled={estimate.status === 'sent'}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SteppedEstimateBuilder
        open={showEstimateBuilder}
        onOpenChange={setShowEstimateBuilder}
        jobId={jobId}
        existingEstimate={selectedEstimate}
        onEstimateCreated={handleEstimateCreated}
      />
    </div>
  );
};
