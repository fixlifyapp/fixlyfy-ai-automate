
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { UnifiedDocumentPreview } from '@/components/jobs/dialogs/unified/UnifiedDocumentPreview';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
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
      const sessionToken = localStorage.getItem('client_portal_session');
      
      if (!sessionToken) {
        toast.error('Please log in to view your estimates');
        return;
      }

      const response = await fetch('/supabase/functions/v1/client-portal-estimates', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch estimates');
      }

      const data = await response.json();
      setEstimates(data.estimates || []);
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

  const calculateSubtotal = () => {
    if (!selectedEstimate) return 0;
    return selectedEstimate.lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.13; // 13% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
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
            View and download your service estimates
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
                      <CardDescription>{estimate.jobs?.title || 'Service Request'}</CardDescription>
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
                      <span className="text-sm">{new Date(estimate.date || estimate.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">${estimate.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    {estimate.jobs?.address && (
                      <div className="text-sm text-muted-foreground">
                        📍 {estimate.jobs.address}
                      </div>
                    )}
                  </div>
                  
                  {estimate.jobs?.description && (
                    <p className="text-sm text-muted-foreground mb-4">{estimate.jobs.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleViewEstimate(estimate)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Estimate Preview - {selectedEstimate?.estimate_number}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto max-h-[80vh]">
                          {selectedEstimate && (
                            <UnifiedDocumentPreview
                              documentType="estimate"
                              documentNumber={selectedEstimate.estimate_number}
                              lineItems={selectedEstimate.lineItems.map(item => ({
                                id: item.id,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unit_price,
                                taxable: item.taxable,
                                name: item.description,
                                price: item.unit_price,
                                total: item.quantity * item.unit_price
                              }))}
                              taxRate={13}
                              calculateSubtotal={calculateSubtotal}
                              calculateTotalTax={calculateTax}
                              calculateGrandTotal={calculateTotal}
                              notes={selectedEstimate.notes || ''}
                              issueDate={new Date(selectedEstimate.date || selectedEstimate.created_at).toLocaleDateString()}
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
