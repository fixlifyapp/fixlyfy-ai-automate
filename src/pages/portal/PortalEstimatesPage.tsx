
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ClientEstimateView } from '@/components/jobs/estimates/ClientEstimateView';

interface PortalEstimate {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  created_at: string;
  valid_until?: string;
  job: {
    id: string;
    title: string;
  };
}

export const PortalEstimatesPage = () => {
  const [estimates, setEstimates] = useState<PortalEstimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<PortalEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      // For now, fetch all estimates. In production, this would be filtered by client
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          jobs:job_id(id, title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to handle the job relationship correctly
      const transformedData = (data || []).map(estimate => ({
        ...estimate,
        job: {
          id: estimate.job_id,
          title: Array.isArray(estimate.jobs) 
            ? estimate.jobs[0]?.title || `Job ${estimate.job_id}`
            : estimate.jobs?.title || `Job ${estimate.job_id}`
        }
      }));

      setEstimates(transformedData);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (estimateId: string, newStatus: string) => {
    setEstimates(prev => 
      prev.map(est => 
        est.id === estimateId 
          ? { ...est, status: newStatus }
          : est
      )
    );
  };

  const renderStatusBadge = (status: string) => {
    const config = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={config[status as keyof typeof config] || config.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (selectedEstimate) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedEstimate(null)}
            className="mb-4"
          >
            ← Back to Estimates
          </Button>
        </div>
        <ClientEstimateView
          estimateId={selectedEstimate.id}
          onStatusChange={(newStatus) => handleStatusChange(selectedEstimate.id, newStatus)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Estimates</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your service estimates
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No estimates found</h3>
            <p className="text-muted-foreground">
              You don't have any estimates yet. Check back later or contact us for a quote.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {estimates.map((estimate) => (
            <Card key={estimate.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{estimate.estimate_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {estimate.job.title}
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(estimate.created_at).toLocaleDateString()}
                    </div>
                    {estimate.valid_until && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Valid until {new Date(estimate.valid_until).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEstimate(estimate)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Add default export
export default PortalEstimatesPage;
