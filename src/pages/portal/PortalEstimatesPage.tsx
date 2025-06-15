
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { FileText, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PortalEstimate {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  created_at: string;
  job_title?: string;
}

export const PortalEstimatesPage = () => {
  const [estimates, setEstimates] = useState<PortalEstimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      // Get client session from localStorage or URL params
      const sessionToken = localStorage.getItem('client_session_token') || 
                           new URLSearchParams(window.location.search).get('token');
      
      if (!sessionToken) {
        toast.error('Session not found');
        return;
      }

      // Validate session and get client info
      const { data: sessionData, error: sessionError } = await supabase
        .rpc('validate_client_session', { p_session_token: sessionToken });

      if (sessionError || !sessionData?.[0]) {
        toast.error('Invalid session');
        return;
      }

      const clientId = sessionData[0].client_id;

      // Fetch estimates for client's jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('client_id', clientId);

      if (jobsError) throw jobsError;

      if (!jobsData || jobsData.length === 0) {
        setEstimates([]);
        return;
      }

      const jobIds = jobsData.map(job => job.id);

      // Fetch estimates for these jobs
      const { data: estimatesData, error: estimatesError } = await supabase
        .from('estimates')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (estimatesError) throw estimatesError;

      // Map estimates with job titles
      const estimatesWithJobTitles: PortalEstimate[] = (estimatesData || []).map(estimate => {
        const job = jobsData.find(j => j.id === estimate.job_id);
        return {
          id: estimate.id,
          estimate_number: estimate.estimate_number,
          total: estimate.total,
          status: estimate.status,
          created_at: estimate.created_at,
          job_title: job?.title || 'Unknown Job'
        };
      });

      setEstimates(estimatesWithJobTitles);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast.error('Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEstimate = (estimateId: string) => {
    window.open(`/estimates/${estimateId}`, '_blank');
  };

  const handleApproveEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', estimateId);

      if (error) throw error;

      toast.success('Estimate approved successfully');
      fetchEstimates(); // Refresh the list
    } catch (error) {
      console.error('Error approving estimate:', error);
      toast.error('Failed to approve estimate');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">My Estimates</h1>
      </div>

      {estimates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No estimates found</p>
            <p className="text-muted-foreground">You don't have any estimates at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {estimates.map((estimate) => (
            <Card key={estimate.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span>Estimate {estimate.estimate_number}</span>
                    {getStatusBadge(estimate.status)}
                  </div>
                  <span className="text-xl font-bold">
                    {formatCurrency(estimate.total)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Job: {estimate.job_title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(estimate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEstimate(estimate.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {estimate.status === 'sent' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveEstimate(estimate.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
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
