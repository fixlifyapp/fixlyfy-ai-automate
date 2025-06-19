
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CreditCard,
  BarChart3,
  History
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

const PublicEnhancedPortal = () => {
  const { accessId, clientId, jobId } = useParams();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const actualClientId = clientId || accessId;

  useEffect(() => {
    const loadPortalData = async () => {
      if (!actualClientId) {
        setError("Invalid access link");
        setLoading(false);
        return;
      }

      try {
        console.log("🔐 Loading portal data for client:", actualClientId);

        const { data, error: functionError } = await supabase.functions.invoke(
          'enhanced-portal-data',
          {
            body: { accessToken: actualClientId }
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

    loadPortalData();
  }, [actualClientId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredEstimates = jobId ? portalData?.estimates.filter(est => est.job_id === jobId) : portalData?.estimates;
  const filteredInvoices = jobId ? portalData?.invoices.filter(inv => inv.job_id === jobId) : portalData?.invoices;
  const filteredJobs = jobId ? portalData?.jobs.filter(job => job.id === jobId) : portalData?.jobs;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Portal</h3>
            <p className="text-gray-600">Please wait while we load your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-4 shadow-xl">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
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

  // Calculate dashboard stats
  const totalEstimates = filteredEstimates?.length || 0;
  const totalInvoices = filteredInvoices?.length || 0;
  const totalEstimateValue = filteredEstimates?.reduce((sum, est) => sum + (est.total_amount || 0), 0) || 0;
  const totalInvoiceValue = filteredInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const paidInvoices = filteredInvoices?.filter(inv => inv.status === 'paid').length || 0;
  const pendingInvoices = totalInvoices - paidInvoices;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {jobId ? 'Job Portal' : 'Client Portal'}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {portalData.client.name}
                {jobId && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Job #{jobId.substring(0, 8)}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Powered by</div>
              <div className="font-semibold text-primary">Fixlify</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 sm:mb-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-1 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-lg border">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-200"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              
              {portalData.permissions.view_estimates && (
                <TabsTrigger 
                  value="estimates" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Estimates</span>
                </TabsTrigger>
              )}
              
              {portalData.permissions.view_invoices && (
                <TabsTrigger 
                  value="invoices" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-200"
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Invoices</span>
                </TabsTrigger>
              )}
              
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-200"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Estimates</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-900">{totalEstimates}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-blue-700 text-sm mt-2">{formatCurrency(totalEstimateValue)} total value</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Invoices</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-900">{totalInvoices}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-green-700 text-sm mt-2">{formatCurrency(totalInvoiceValue)} total value</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Paid Invoices</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-900">{paidInvoices}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-purple-700 text-sm mt-2">All payments up to date</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Pending</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-900">{pendingInvoices}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-orange-700 text-sm mt-2">Awaiting payment</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEstimates?.slice(0, 3).map((estimate: any) => (
                    <div key={estimate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Estimate #{estimate.id?.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">{formatDate(estimate.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(estimate.total_amount)}</p>
                        <Badge className={getStatusColor(estimate.status)}>
                          {estimate.status || 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {filteredInvoices?.slice(0, 2).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Invoice #{invoice.id?.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">{formatDate(invoice.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{formatCurrency(invoice.total_amount)}</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estimates Tab */}
          {portalData.permissions.view_estimates && (
            <TabsContent value="estimates" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Your Estimates ({filteredEstimates?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredEstimates && filteredEstimates.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredEstimates.map((estimate: any) => (
                        <div key={estimate.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">Estimate #{estimate.id?.substring(0, 8)}</h3>
                                <Badge className={`${getStatusColor(estimate.status)} flex items-center gap-1`}>
                                  {getStatusIcon(estimate.status)}
                                  {estimate.status || 'Draft'}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">
                                Created: {formatDate(estimate.created_at)}
                              </p>
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(estimate.total_amount)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Estimates Available</h3>
                      <p className="text-gray-600">You don't have any estimates yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Invoices Tab */}
          {portalData.permissions.view_invoices && (
            <TabsContent value="invoices" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Your Invoices ({filteredInvoices?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredInvoices && filteredInvoices.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredInvoices.map((invoice: any) => (
                        <div key={invoice.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">Invoice #{invoice.id?.substring(0, 8)}</h3>
                                <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1`}>
                                  {getStatusIcon(invoice.status)}
                                  {invoice.status || 'Pending'}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">
                                Due: {formatDate(invoice.due_date || invoice.created_at)}
                              </p>
                              <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(invoice.total_amount)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              {portalData.permissions.make_payments && invoice.status !== 'paid' && (
                                <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Available</h3>
                      <p className="text-gray-600">You don't have any invoices yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Service History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Service History ({filteredJobs?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredJobs && filteredJobs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJobs.map((job: any) => (
                      <div key={job.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{job.title || 'Service Call'}</h3>
                          <Badge className={`${getStatusColor(job.status)} flex items-center gap-1`}>
                            {getStatusIcon(job.status)}
                            {job.status || 'Scheduled'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(job.created_at)}</span>
                          </div>
                          {job.scheduled_start && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Scheduled: {formatDate(job.scheduled_start)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service History</h3>
                    <p className="text-gray-600">No service history available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <Mail className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Email</div>
                      <div className="font-semibold text-blue-900">{portalData.client.email}</div>
                    </div>
                  </div>
                  
                  {portalData.client.phone && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <Phone className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-sm text-green-600 font-medium">Phone</div>
                        <div className="font-semibold text-green-900">{portalData.client.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {portalData.client.address && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl sm:col-span-2 lg:col-span-1">
                      <MapPin className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-sm text-purple-600 font-medium">Address</div>
                        <div className="font-semibold text-purple-900">
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
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to assist you with any questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="mailto:support@fixlify.app" className="text-primary hover:text-primary/80 font-medium">
                📧 support@fixlify.app
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="text-gray-500">© 2024 Fixlify. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEnhancedPortal;
