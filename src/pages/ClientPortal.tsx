
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, FileText, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientPortalData {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  estimates: Array<{
    id: string;
    estimate_number: string;
    title: string;
    total: number;
    status: string;
    created_at: string;
    valid_until: string;
  }>;
  invoices: Array<{
    id: string;
    invoice_number: string;
    title: string;
    total: number;
    status: string;
    due_date: string;
    created_at: string;
  }>;
}

export default function ClientPortal() {
  const { accessId } = useParams();
  const [data, setData] = useState<ClientPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessId) {
      loadPortalData(accessId);
    }
  }, [accessId]);

  const loadPortalData = async (id: string) => {
    try {
      setLoading(true);
      const { data: portalData, error } = await supabase.functions.invoke('get-client-portal-data', {
        body: { accessId: id }
      });

      if (error) throw error;
      
      if (portalData) {
        setData(portalData);
      } else {
        setError('Access link not found or expired');
      }
    } catch (err: any) {
      console.error('Portal data load error:', err);
      setError('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  const approveEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase.functions.invoke('approve-estimate', {
        body: { estimateId, accessId }
      });

      if (error) throw error;
      
      toast.success('Estimate approved successfully!');
      
      // Reload data to reflect changes
      if (accessId) {
        await loadPortalData(accessId);
      }
    } catch (err: any) {
      console.error('Approve estimate error:', err);
      toast.error('Failed to approve estimate');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      draft: { color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> },
      sent: { color: "bg-blue-500", icon: <FileText className="h-3 w-3" /> },
      approved: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { color: "bg-red-500", icon: <AlertCircle className="h-3 w-3" /> },
      paid: { color: "bg-green-600", icon: <DollarSign className="h-3 w-3" /> },
      overdue: { color: "bg-red-600", icon: <AlertCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || 'Invalid access link'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600">Welcome, {data.client.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{data.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{data.client.email}</p>
              </div>
              {data.client.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{data.client.phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estimates */}
        {data.estimates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estimates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.estimates.map((estimate) => (
                  <div key={estimate.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{estimate.title}</h3>
                        <p className="text-sm text-gray-500">#{estimate.estimate_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${estimate.total.toFixed(2)}</p>
                        {getStatusBadge(estimate.status)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <span>Created: {new Date(estimate.created_at).toLocaleDateString()}</span>
                      {estimate.valid_until && (
                        <span>Valid until: {new Date(estimate.valid_until).toLocaleDateString()}</span>
                      )}
                    </div>

                    {estimate.status === 'sent' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => approveEstimate(estimate.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Estimate
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoices */}
        {data.invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{invoice.title}</h3>
                        <p className="text-sm text-gray-500">#{invoice.invoice_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${invoice.total.toFixed(2)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Created: {new Date(invoice.created_at).toLocaleDateString()}</span>
                      {invoice.due_date && (
                        <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {data.estimates.length === 0 && data.invoices.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
              <p className="text-gray-500">
                Your estimates and invoices will appear here when they're available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
