
import { useEffect, useState } from "react";
import { useClientPortalAuth } from "@/hooks/useClientPortalAuth";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Eye, Check, X } from "lucide-react";
import { EstimatePreview } from "@/components/jobs/dialogs/estimate-builder/EstimatePreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Estimate {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
  job_id: string;
}

interface PortalLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxable: boolean;
}

export default function PortalEstimatesPage() {
  const { user } = useClientPortalAuth();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<PortalLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEstimates();
    }
  }, [user]);

  const fetchEstimates = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // First get job IDs for this client
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('client_id', user.clientId);

      if (!jobs || jobs.length === 0) {
        setEstimates([]);
        return;
      }

      const jobIds = jobs.map(job => job.id);

      // Fetch estimates for these jobs
      const { data: estimatesData, error } = await supabase
        .from('estimates')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEstimates(estimatesData || []);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLineItems = async (estimateId: string) => {
    try {
      const { data, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimateId);

      if (error) throw error;

      const items = (data || []).map(item => ({
        id: item.id,
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unit_price) || 0,
        discount: 0, // Default discount since it's not in the schema
        taxable: item.taxable || true // Ensure taxable property is always present
      }));

      setLineItems(items);
    } catch (error) {
      console.error('Error fetching line items:', error);
      toast.error('Failed to load estimate details');
    }
  };

  const handleViewEstimate = async (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    await fetchLineItems(estimate.id);
    setShowPreview(true);
  };

  const handleEstimateAction = async (estimateId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('estimates')
        .update({ status: newStatus })
        .eq('id', estimateId);

      if (error) throw error;

      // Update local state
      setEstimates(prev => prev.map(est => 
        est.id === estimateId ? { ...est, status: newStatus } : est
      ));

      // Create notification
      await supabase
        .from('client_notifications')
        .insert({
          client_id: user?.clientId,
          type: `estimate_${action}d`,
          title: `Estimate ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: `You have ${action}d estimate ${selectedEstimate?.estimate_number}`
        });

      toast.success(`Estimate ${action}d successfully`);
      setShowPreview(false);
      setSelectedEstimate(null);
    } catch (error) {
      console.error(`Error ${action}ing estimate:`, error);
      toast.error(`Failed to ${action} estimate`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discount / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const calculateTotalTax = () => {
    const taxableSubtotal = lineItems
      .filter(item => true) // Assuming all items are taxable for now
      .reduce((sum, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        const discountAmount = itemTotal * (item.discount / 100);
        return sum + (itemTotal - discountAmount);
      }, 0);
    
    return taxableSubtotal * 0.13; // 13% tax rate
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Estimates</h1>
          <p className="text-gray-600">View and manage your service estimates</p>
        </div>

        {estimates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates yet</h3>
              <p className="text-gray-600">Your estimates will appear here once they're created.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {estimates.map((estimate) => (
              <Card key={estimate.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{estimate.estimate_number}</CardTitle>
                      <CardDescription>
                        Created on {new Date(estimate.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${estimate.total?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {estimate.notes && (
                    <p className="text-gray-600 mb-4">{estimate.notes}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewEstimate(estimate)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {estimate.status === 'sent' || estimate.status === 'viewed' ? (
                      <>
                        <Button
                          onClick={() => handleEstimateAction(estimate.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleEstimateAction(estimate.id, 'reject')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estimate Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Estimate Details</DialogTitle>
            </DialogHeader>
            {selectedEstimate && (
              <EstimatePreview
                estimateNumber={selectedEstimate.estimate_number}
                lineItems={lineItems}
                notes={selectedEstimate.notes || ''}
                taxRate={13}
                calculateSubtotal={calculateSubtotal}
                calculateTotalTax={calculateTotalTax}
                calculateGrandTotal={calculateGrandTotal}
                clientInfo={{
                  name: user?.name,
                  email: user?.email
                }}
              />
            )}
            {selectedEstimate && (selectedEstimate.status === 'sent' || selectedEstimate.status === 'viewed') && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleEstimateAction(selectedEstimate.id, 'approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Estimate
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleEstimateAction(selectedEstimate.id, 'reject')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Estimate
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}
