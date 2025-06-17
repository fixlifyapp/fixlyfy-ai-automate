
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  XCircle
} from "lucide-react";

interface PortalData {
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
  jobs: any[];
  messages: any[];
  documents: any[];
  preferences: {
    theme: string;
    language: string;
    notification_preferences: any;
    timezone: string;
  };
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
}

const EnhancedClientPortal = () => {
  const { accessId } = useParams();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAndLoadPortal = async () => {
      if (!accessId) {
        setError("Invalid access link");
        setLoading(false);
        return;
      }

      try {
        console.log("🔐 Loading portal data for client:", accessId);

        // For portal.fixlify.app, accessId is the client_id - no authentication needed
        const { data, error: functionError } = await supabase.functions.invoke(
          'enhanced-portal-data',
          {
            body: { accessToken: accessId }
          }
        );

        if (functionError) {
          console.error("❌ Portal data error:", functionError);
          setError("Failed to load portal data");
          return;
        }

        if (!data) {
          setError("No data returned from portal");
          return;
        }

        console.log("✅ Portal data loaded:", data);
        setPortalData(data);
      } catch (error) {
        console.error("❌ Error loading portal:", error);
        setError("Failed to load portal data");
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadPortal();
  }, [accessId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              {error || "Invalid or expired access link"}
            </p>
            <p className="text-sm text-gray-500">
              Please contact us for a new access link.
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
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">Welcome, {portalData.client.name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Fixlify Portal</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center gap-3">
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
                  Estimates ({portalData.estimates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portalData.estimates.length > 0 ? (
                  <div className="space-y-4">
                    {portalData.estimates.map((estimate: any) => (
                      <div key={estimate.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Estimate #{estimate.id?.substring(0, 8)}</div>
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
                            {formatCurrency(estimate.total_amount)}
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
                  Invoices ({portalData.invoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portalData.invoices.length > 0 ? (
                  <div className="space-y-4">
                    {portalData.invoices.map((invoice: any) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Invoice #{invoice.id?.substring(0, 8)}</div>
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
                            {formatCurrency(invoice.total_amount)}
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

        {/* Jobs */}
        {portalData.jobs.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Service History ({portalData.jobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portalData.jobs.map((job: any) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{job.title || 'Service Call'}</div>
                      <Badge className={getStatusColor(job.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          {job.status || 'Scheduled'}
                        </div>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {job.description}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(job.created_at)}
                      </div>
                      {job.scheduled_start && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Scheduled: {formatDate(job.scheduled_start)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p>© 2024 Fixlify. All rights reserved.</p>
          <p className="mt-1">
            Need help? Contact us at support@fixlify.app
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedClientPortal;
