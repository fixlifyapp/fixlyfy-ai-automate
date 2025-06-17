
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wrench
} from "lucide-react";

interface JobPortalData {
  job: {
    id: string;
    title: string;
    description?: string;
    status: string;
    address?: string;
    scheduled_start?: string;
    created_at: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  estimates: any[];
  invoices: any[];
  messages: any[];
  documents: any[];
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
}

const PublicJobPortal = () => {
  const { jobNumber } = useParams();
  const [portalData, setPortalData] = useState<JobPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobPortalData = async () => {
      if (!jobNumber) {
        setError("Invalid job number");
        setLoading(false);
        return;
      }

      try {
        console.log("🔐 Loading job portal data for job:", jobNumber);

        // Call the enhanced portal data function with job number
        const { data, error: functionError } = await supabase.functions.invoke(
          'job-portal-data',
          {
            body: { jobNumber }
          }
        );

        if (functionError) {
          console.error("❌ Job portal data error:", functionError);
          setError("Failed to load job data");
          return;
        }

        if (!data) {
          setError("No data returned from portal");
          return;
        }

        console.log("✅ Job portal data loaded:", data);
        setPortalData(data);
      } catch (error) {
        console.error("❌ Error loading job portal:", error);
        setError("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    loadJobPortalData();
  }, [jobNumber]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'in-progress':
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Not Found</h3>
            <p className="text-gray-600 mb-4">
              {error || "Could not find the requested job"}
            </p>
            <p className="text-sm text-gray-500">
              Please verify the job number and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                Job Portal
              </h1>
              <p className="text-gray-600">
                Job #{jobNumber} - {portalData.job.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Fixlify Services</div>
              <Badge className={getStatusColor(portalData.job.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(portalData.job.status)}
                  {portalData.job.status}
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Description</h4>
                <p className="text-gray-600">{portalData.job.description || 'No description provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Address</h4>
                <p className="text-gray-600">{portalData.job.address || 'Address not specified'}</p>
              </div>
              {portalData.job.scheduled_start && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Scheduled Time</h4>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(portalData.job.scheduled_start)}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                <p className="text-gray-600">{formatDate(portalData.job.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{portalData.client.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{portalData.client.email}</div>
                </div>
              </div>
              {portalData.client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{portalData.client.phone}</div>
                  </div>
                </div>
              )}
              {portalData.client.address && (
                <div className="flex items-center gap-3 md:col-span-2 lg:col-span-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium">
                      {portalData.client.address}
                      {portalData.client.city && `, ${portalData.client.city}`}
                      {portalData.client.state && `, ${portalData.client.state}`}
                      {portalData.client.zip && ` ${portalData.client.zip}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estimates */}
          {portalData.permissions.view_estimates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estimates ({portalData.estimates?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portalData.estimates && portalData.estimates.length > 0 ? (
                  <div className="space-y-4">
                    {portalData.estimates.map((estimate: any) => (
                      <div key={estimate.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Estimate #{estimate.estimate_number}</div>
                          <Badge className={getStatusColor(estimate.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(estimate.status)}
                              {estimate.status || 'Draft'}
                            </div>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Created: {formatDate(estimate.created_at)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(estimate.total)}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No estimates available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Invoices */}
          {portalData.permissions.view_invoices && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Invoices ({portalData.invoices?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portalData.invoices && portalData.invoices.length > 0 ? (
                  <div className="space-y-4">
                    {portalData.invoices.map((invoice: any) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Invoice #{invoice.invoice_number}</div>
                          <Badge className={getStatusColor(invoice.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {invoice.status || 'Pending'}
                            </div>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Due: {formatDate(invoice.due_date || invoice.created_at)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-blue-600">
                            {formatCurrency(invoice.total)}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {portalData.permissions.make_payments && invoice.status !== 'paid' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p>© 2024 Fixlify Services. All rights reserved.</p>
          <p className="mt-1">
            Need help? Contact us at support@fixlify.app
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicJobPortal;
