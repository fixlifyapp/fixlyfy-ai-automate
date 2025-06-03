
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { UnifiedDocumentPreview } from '@/components/jobs/dialogs/unified/UnifiedDocumentPreview';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface Estimate {
  id: string;
  estimate_number: string;
  date: string;
  status: string;
  total: number;
  notes?: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    description?: string;
    address?: string;
    clients: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company?: string;
    };
  };
  lineItems: LineItem[];
}

const PortalEstimatesPage = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useClientPortalAuth();

  useEffect(() => {
    if (user) {
      fetchEstimates();
    }
  }, [user]);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      
      if (!user?.client_email) {
        console.error('No client email available');
        return;
      }

      // Set the client email in the session for RLS
      await supabase.rpc('set_client_portal_user_email', {
        user_email: user.client_email
      });

      const { data: estimatesData, error } = await supabase
        .from('estimate_details_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching estimates:', error);
        toast.error('Failed to load estimates');
        return;
      }

      // Transform data to match expected structure
      const transformedEstimates = estimatesData?.map(estimate => ({
        id: estimate.estimate_id,
        estimate_number: estimate.estimate_number,
        date: estimate.created_at,
        status: estimate.status,
        total: estimate.total || 0,
        notes: estimate.notes,
        created_at: estimate.created_at,
        jobs: {
          id: estimate.job_id,
          title: estimate.job_title,
          description: estimate.job_description,
          address: '', // Not available in view
          clients: {
            id: estimate.client_id,
            name: estimate.client_name,
            email: estimate.client_email,
            phone: estimate.client_phone,
            company: estimate.client_company
          }
        },
        lineItems: [] // Line items would need separate fetch
      })) || [];

      setEstimates(transformedEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setPreviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading estimates...</span>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Estimates</h1>
          <p className="text-muted-foreground">
            View and review your service estimates
          </p>
        </div>

        {estimates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
                <p className="text-gray-500">You don't have any estimates yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {estimates.map((estimate) => (
              <Card key={estimate.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{estimate.estimate_number}</CardTitle>
                      <CardDescription>{estimate.jobs?.title || 'Service Estimate'}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(estimate.status)}>
                      {estimate.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(estimate.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">${estimate.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status: {estimate.status}</span>
                    </div>
                  </div>
                  
                  {estimate.jobs?.description && (
                    <p className="text-sm text-muted-foreground mb-4">{estimate.jobs.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleViewEstimate(estimate)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Estimate Details - {selectedEstimate?.estimate_number}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto max-h-[80vh]">
                          {selectedEstimate && (
                            <UnifiedDocumentPreview
                              documentType="estimate"
                              documentNumber={selectedEstimate.estimate_number}
                              lineItems={selectedEstimate.lineItems?.map(item => ({
                                id: item.id,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unit_price,
                                taxable: item.taxable,
                                name: item.description,
                                price: item.unit_price,
                                total: item.quantity * item.unit_price
                              })) || []}
                              taxRate={8.5}
                              calculateSubtotal={() => selectedEstimate.total * 0.92}
                              calculateTotalTax={() => selectedEstimate.total * 0.08}
                              calculateGrandTotal={() => selectedEstimate.total}
                              notes={selectedEstimate.notes || ''}
                              issueDate={new Date(selectedEstimate.created_at).toLocaleDateString()}
                              dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    
                    {estimate.status === 'sent' && (
                      <Button size="sm">
                        Approve Estimate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalEstimatesPage;
