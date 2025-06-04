
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, DollarSign, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface Estimate {
  id: string;
  estimate_number: string;
  status: string;
  total: number;
  created_at: string;
  job_id: string;
  job_title: string;
  notes?: string;
}

export default function PortalEstimatesPage() {
  const { user } = useClientPortalAuth();
  const [searchParams] = useSearchParams();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

  const estimateId = searchParams.get('id');
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (user) {
      fetchEstimates();
    }
  }, [user, estimateId, jobId]);

  const fetchEstimates = async () => {
    if (!user?.clientId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('estimates')
        .select(`
          id,
          estimate_number,
          status,
          total,
          created_at,
          job_id,
          notes,
          jobs!inner(
            id,
            title,
            client_id
          )
        `)
        .eq('jobs.client_id', user.clientId)
        .order('created_at', { ascending: false });

      if (estimateId) {
        query = query.eq('id', estimateId);
      }

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching estimates:', error);
        toast.error('Failed to load estimates');
        return;
      }

      const formattedEstimates = (data || []).map(estimate => ({
        ...estimate,
        job_title: Array.isArray(estimate.jobs) ? estimate.jobs[0]?.title : estimate.jobs?.title
      }));

      setEstimates(formattedEstimates);

      if (estimateId && formattedEstimates.length > 0) {
        setSelectedEstimate(formattedEstimates[0]);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <PortalLayout>
        <LoadingSkeleton type="card" />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Estimates</h1>
          <p className="text-gray-600">
            {estimateId ? 'Estimate details' : 'View all your project estimates and quotes'}
          </p>
        </div>

        {estimates.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
                <p className="text-gray-600">
                  {estimateId || jobId ? 'No estimates found for this criteria.' : "You don't have any estimates yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Estimates List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {estimates.length} Estimate{estimates.length !== 1 ? 's' : ''}
              </h2>
              
              {estimates.map((estimate) => (
                <Card 
                  key={estimate.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedEstimate?.id === estimate.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEstimate(estimate)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{estimate.estimate_number}</CardTitle>
                        <CardDescription className="mt-1">
                          Project: {estimate.job_title}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(estimate.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span>${estimate.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Estimate Details */}
            <div>
              {selectedEstimate ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedEstimate.estimate_number}
                      <Badge className={getStatusColor(selectedEstimate.status)}>
                        {selectedEstimate.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Project: {selectedEstimate.job_title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Estimate Details</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{formatDate(selectedEstimate.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedEstimate.status)}>
                            {selectedEstimate.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">${selectedEstimate.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedEstimate.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{selectedEstimate.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 space-y-2">
                      <Button className="w-full" disabled>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Estimate
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Full estimate viewing coming soon
                      </p>
                    </div>

                    {selectedEstimate.status === 'sent' && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Action Required</h4>
                        <p className="text-sm text-blue-800">
                          This estimate is awaiting your review and approval. Please contact us if you have any questions.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Select an estimate to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
