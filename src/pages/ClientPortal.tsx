
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Clock, AlertCircle, Eye, Download, User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

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
  jobs: any[];
  estimates: any[];
  invoices: any[];
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
}

const ClientPortal = () => {
  const { accessToken } = useParams();
  const navigate = useNavigate();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    validateAndLoadPortal();
  }, [accessToken]);

  const validateAndLoadPortal = async () => {
    if (!accessToken) {
      setError("No access token provided");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Loading enhanced portal data...");

      // Use the enhanced portal data function
      const { data, error: functionError } = await supabase.functions.invoke(
        'enhanced-portal-data',
        {
          body: { accessToken }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'sent':
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateTotals = () => {
    const estimates = portalData?.estimates || [];
    const invoices = portalData?.invoices || [];
    
    const totalEstimates = estimates.length;
    const totalEstimateValue = estimates.reduce((sum, est) => sum + (est.total || 0), 0);
    
    const totalInvoices = invoices.length;
    const totalInvoiceValue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.payment_status === 'paid').length;
    const paidValue = invoices
      .filter(inv => inv.status === 'paid' || inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const pendingInvoices = invoices.filter(inv => 
      inv.status !== 'paid' && inv.payment_status !== 'paid'
    ).length;

    return {
      totalEstimates,
      totalEstimateValue,
      totalInvoices,
      totalInvoiceValue,
      paidInvoices,
      paidValue,
      pendingInvoices
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Client Portal
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Welcome back, {portalData.client.name}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <span>Powered by</span>
              <span className="font-medium text-purple-600">Fixlify</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Client Info Card - Mobile Responsive */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="font-medium text-sm sm:text-base truncate">{portalData.client.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium text-sm sm:text-base truncate">{portalData.client.email}</div>
                </div>
              </div>
              {portalData.client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium text-sm sm:text-base">{portalData.client.phone}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-500">Total Estimates</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.totalEstimates}</div>
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    {formatCurrency(totals.totalEstimateValue)} total value
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-500">Total Invoices</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.totalInvoices}</div>
                  <div className="text-xs sm:text-sm text-green-600 font-medium">
                    {formatCurrency(totals.totalInvoiceValue)} total value
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-500">Paid Invoices</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.paidInvoices}</div>
                  <div className="text-xs sm:text-sm text-purple-600 font-medium">
                    {formatCurrency(totals.paidValue)} paid
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-500">Pending</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{totals.pendingInvoices}</div>
                  <div className="text-xs sm:text-sm text-orange-600 font-medium">
                    Awaiting payment
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile Responsive */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="estimates" className="text-xs sm:text-sm">Estimates</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm">Invoices</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...portalData.estimates, ...portalData.invoices]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((item: any) => {
                      const isEstimate = 'estimate_number' in item;
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2 rounded-lg ${isEstimate ? 'bg-blue-50' : 'bg-green-50'}`}>
                              {isEstimate ? 
                                <FileText className="h-4 w-4 text-blue-600" /> : 
                                <DollarSign className="h-4 w-4 text-green-600" />
                              }
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm sm:text-base truncate">
                                {isEstimate ? 'Estimate' : 'Invoice'} #{isEstimate ? item.estimate_number : item.invoice_number}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-semibold text-sm sm:text-base">
                              {formatCurrency(item.total)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status || 'draft'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Estimates ({portalData.estimates?.length || 0})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portalData.estimates && portalData.estimates.length > 0 ? (
                  <div className="space-y-4">
                    {portalData.estimates.map((estimate: any) => (
                      <div key={estimate.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base">Estimate #{estimate.estimate_number}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatDate(estimate.created_at)}
                            </p>
                            {estimate.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                {estimate.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-semibold text-green-600">
                                {formatCurrency(estimate.total)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(estimate.status)}`}>
                                {estimate.status || 'draft'}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
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
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Your Invoices ({portalData.invoices?.length || 0})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portalData.invoices && portalData.invoices.length > 0 ? (
                  <div className="space-y-4">
                    {portalData.invoices.map((invoice: any) => (
                      <div key={invoice.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base">Invoice #{invoice.invoice_number}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Due: {formatDate(invoice.due_date || invoice.created_at)}
                            </p>
                            {invoice.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                {invoice.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-semibold text-blue-600">
                                {formatCurrency(invoice.total)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status || invoice.payment_status)}`}>
                                {invoice.status || invoice.payment_status || 'pending'}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {portalData.permissions.make_payments && 
                               (invoice.status !== 'paid' && invoice.payment_status !== 'paid') && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                                  Pay Now
                                </Button>
                              )}
                            </div>
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
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...portalData.estimates, ...portalData.invoices]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item: any) => {
                      const isEstimate = 'estimate_number' in item;
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2 rounded-lg ${isEstimate ? 'bg-blue-50' : 'bg-green-50'}`}>
                              {isEstimate ? 
                                <FileText className="h-4 w-4 text-blue-600" /> : 
                                <DollarSign className="h-4 w-4 text-green-600" />
                              }
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm sm:text-base">
                                {isEstimate ? 'Estimate' : 'Invoice'} #{isEstimate ? item.estimate_number : item.invoice_number}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm sm:text-base">
                              {formatCurrency(item.total)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status || 'draft'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer - Dynamic Year */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-medium text-purple-800 mb-2">Need Help?</p>
            <p className="text-purple-700 mb-3">Our support team is here to assist you with any questions.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-purple-600">
              <Mail className="h-4 w-4" />
              <span>support@fixlify.app</span>
            </div>
          </div>
          <div className="mt-4">
            <p>© {currentYear} Fixlify. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
