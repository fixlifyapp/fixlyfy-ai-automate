import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertCircle, FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientPortalHeader } from "@/components/portal/ClientPortalHeader";
import { ClientInfoCard } from "@/components/portal/ClientInfoCard";
import { DashboardStats } from "@/components/portal/DashboardStats";
import { DocumentList } from "@/components/portal/DocumentList";
import { ClientPortalFooter } from "@/components/portal/ClientPortalFooter";

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
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
  jobs: any[];
  estimates: any[];
  invoices: any[];
  permissions: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
  totals?: {
    estimates: {
      count: number;
      value: number;
    };
    invoices: {
      count: number;
      value: number;
    };
    paid: {
      count: number;
      value: number;
    };
    pending: {
      count: number;
    };
  };
}

const ClientPortal = () => {
  const { accessToken } = useParams();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.log("🔐 Loading portal data with token:", accessToken);

      // Load portal data using the enhanced function
      const { data: portalDataResponse, error: portalError } = await supabase.functions.invoke(
        'enhanced-portal-data',
        {
          body: { accessToken }
        }
      );

      if (portalError) {
        console.error("❌ Portal data loading failed:", portalError);
        setError("Failed to load portal data");
        return;
      }

      if (!portalDataResponse) {
        setError("No portal data available");
        return;
      }

      console.log("✅ Portal data loaded:", portalDataResponse);
      console.log("🏢 Company data received:", portalDataResponse.company);
      
      // Debug company data specifically
      if (portalDataResponse.company) {
        console.log("✅ Company data found:", {
          name: portalDataResponse.company.name,
          email: portalDataResponse.company.email,
          phone: portalDataResponse.company.phone,
          website: portalDataResponse.company.website
        });
      } else {
        console.warn("⚠️ No company data in response");
      }

      setPortalData(portalDataResponse);
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
      day: 'numeric',
      year: 'numeric'
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
      case 'converted':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateTotals = () => {
    // Use backend-calculated totals if available
    if (portalData?.totals) {
      console.log("📊 Using backend-calculated totals:", portalData.totals);
      return {
        totalEstimates: portalData.totals.estimates.count,
        totalEstimateValue: portalData.totals.estimates.value,
        totalInvoices: portalData.totals.invoices.count,
        totalInvoiceValue: portalData.totals.invoices.value,
        paidInvoices: portalData.totals.paid.count,
        paidValue: portalData.totals.paid.value,
        pendingInvoices: portalData.totals.pending.count
      };
    }

    // Fallback to client-side calculation if backend totals not available
    console.log("⚠️ Backend totals not available, using client-side calculation");
    const estimates = portalData?.estimates || [];
    const invoices = portalData?.invoices || [];
    
    const totalEstimates = estimates.length;
    const totalEstimateValue = estimates.reduce((sum, est) => {
      const total = parseFloat(est.total?.toString() || '0');
      return sum + total;
    }, 0);
    
    const totalInvoices = invoices.length;
    const totalInvoiceValue = invoices.reduce((sum, inv) => {
      const total = parseFloat(inv.total?.toString() || '0');
      return sum + total;
    }, 0);
    
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.payment_status === 'paid').length;
    const paidValue = invoices
      .filter(inv => inv.status === 'paid' || inv.payment_status === 'paid')
      .reduce((sum, inv) => {
        const total = parseFloat(inv.total?.toString() || '0');
        return sum + total;
      }, 0);
    
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

  console.log("🎯 Rendering ClientPortalFooter with company data:", portalData.company);

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientPortalHeader clientName={portalData.client.name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ClientInfoCard client={portalData.client} />
        <DashboardStats totals={totals} formatCurrency={formatCurrency} />

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
                      const total = parseFloat(item.total?.toString() || '0');
                      const documentNumber = isEstimate ? item.estimate_number : item.invoice_number;
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
                                {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-semibold text-sm sm:text-base">
                              {formatCurrency(total)}
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
            <DocumentList
              title="Your Estimates"
              documents={portalData.estimates}
              documentType="estimate"
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              permissions={portalData.permissions}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <DocumentList
              title="Your Invoices"
              documents={portalData.invoices}
              documentType="invoice"
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              permissions={portalData.permissions}
            />
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
                      const total = parseFloat(item.total?.toString() || '0');
                      const documentNumber = isEstimate ? item.estimate_number : item.invoice_number;
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
                                {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {formatDate(item.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm sm:text-base">
                              {formatCurrency(total)}
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

        <ClientPortalFooter companyData={portalData.company} />
      </div>
    </div>
  );
};

export default ClientPortal;
