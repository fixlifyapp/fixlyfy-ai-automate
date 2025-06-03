
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, DollarSign, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Estimate {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  created_at: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    description?: string;
    address?: string;
  };
}

export default function PortalEstimatesPage() {
  const { user } = useClientPortalAuth();
  const [searchParams] = useSearchParams();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (user) {
      fetchEstimates();
    }
  }, [user, jobId]);

  const fetchEstimates = async () => {
    if (!user?.clientId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('estimates')
        .select(`
          id,
          estimate_number,
          total,
          status,
          created_at,
          notes,
          jobs:job_id (
            id,
            title,
            description,
            address
          )
        `)
        .eq('jobs.client_id', user.clientId)
        .order('created_at', { ascending: false });

      // Filter by specific job if jobId provided
      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching estimates:', error);
        toast.error('Failed to load estimates');
        return;
      }

      const formattedEstimates = data?.map(estimate => ({
        ...estimate,
        job: Array.isArray(estimate.jobs) ? estimate.jobs[0] : estimate.jobs
      })) || [];

      setEstimates(formattedEstimates);

      // If there's a specific job, auto-select the first estimate
      if (jobId && formattedEstimates.length > 0) {
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
      case 'declined':
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

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
  };

  const handleDownloadEstimate = async (estimate: Estimate) => {
    toast.info('Download functionality coming soon');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Estimates</h1>
        <p className="text-gray-600">
          {jobId ? 'Estimate for your specific project' : 'View and manage all your project estimates'}
        </p>
      </div>

      {estimates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
              <p className="text-gray-600">
                {jobId ? 'No estimates available for this project yet.' : 'You don\'t have any estimates yet.'}
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
                onClick={() => handleViewEstimate(estimate)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">#{estimate.estimate_number}</CardTitle>
                      <CardDescription className="mt-1">
                        {estimate.job?.title || 'Service Project'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(estimate.status)}>
                      {estimate.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(estimate.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${estimate.total?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        handleViewEstimate(estimate);
                      }}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadEstimate(estimate);
                      }}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
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
                    Estimate #{selectedEstimate.estimate_number}
                    <Badge className={getStatusColor(selectedEstimate.status)}>
                      {selectedEstimate.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {selectedEstimate.job?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Job:</strong> {selectedEstimate.job?.title}</p>
                      {selectedEstimate.job?.description && (
                        <p><strong>Description:</strong> {selectedEstimate.job.description}</p>
                      )}
                      {selectedEstimate.job?.address && (
                        <p><strong>Address:</strong> {selectedEstimate.job.address}</p>
                      )}
                      <p><strong>Date:</strong> {formatDate(selectedEstimate.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Estimate Total</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedEstimate.total?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {selectedEstimate.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{selectedEstimate.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                    <Button variant="outline" onClick={() => handleDownloadEstimate(selectedEstimate)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>

                  {selectedEstimate.status?.toLowerCase() === 'sent' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                      <p className="text-sm text-blue-800">
                        Please review the estimate details. Contact us if you have any questions or would like to proceed with the project.
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
  );
}
