import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PortalValidationResponse {
  valid: boolean;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  permissions?: {
    view_estimates: boolean;
    view_invoices: boolean;
    make_payments: boolean;
  };
  error?: string;
}

interface PortalData {
  client: any;
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
  const [estimates, setEstimates] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    validateAndLoadPortal();
  }, [accessToken]);

  const validateAndLoadPortal = async () => {
    if (!accessToken) return;

    try {
      // Validate the portal access token
      const { data: validationData, error: validationError } = await supabase
        .rpc('validate_portal_access', {
          p_access_token: accessToken,
          p_ip_address: window.location.hostname,
          p_user_agent: navigator.userAgent
        });

      if (validationError || !validationData) {
        setError("Invalid or expired portal link");
        setLoading(false);
        return;
      }

      // Type the validation response properly
      const validation = validationData as unknown as PortalValidationResponse;

      if (!validation.valid) {
        setError(validation.error || "Invalid or expired portal link");
        setLoading(false);
        return;
      }

      const clientId = validation.client_id;
      const permissions = validation.permissions || {
        view_estimates: true,
        view_invoices: true,
        make_payments: false
      };

      // Load client data
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      setPortalData({
        client: clientData,
        permissions
      });

      // Load estimates if permitted
      if (permissions.view_estimates) {
        const { data: estimatesData } = await supabase
          .from('estimates')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
        
        setEstimates(estimatesData || []);
      }

      // Load invoices if permitted
      if (permissions.view_invoices) {
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
        
        setInvoices(invoicesData || []);
      }

    } catch (error) {
      console.error("Error loading portal:", error);
      setError("Failed to load portal data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {portalData.client.name}
          </h1>
          <p className="text-gray-600 mt-2">View your estimates and invoices</p>
        </div>

        <Tabs defaultValue="estimates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {portalData.permissions.view_estimates && (
              <TabsTrigger value="estimates">
                <FileText className="h-4 w-4 mr-2" />
                Estimates ({estimates.length})
              </TabsTrigger>
            )}
            {portalData.permissions.view_invoices && (
              <TabsTrigger value="invoices">
                <DollarSign className="h-4 w-4 mr-2" />
                Invoices ({invoices.length})
              </TabsTrigger>
            )}
          </TabsList>

          {portalData.permissions.view_estimates && (
            <TabsContent value="estimates">
              <Card>
                <CardHeader>
                  <CardTitle>Your Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                  {estimates.length === 0 ? (
                    <p className="text-gray-500">No estimates found</p>
                  ) : (
                    <div className="space-y-4">
                      {estimates.map((estimate: any) => (
                        <div key={estimate.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold">#{estimate.estimate_number}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(estimate.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${estimate.total?.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">{estimate.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {portalData.permissions.view_invoices && (
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Your Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-gray-500">No invoices found</p>
                  ) : (
                    <div className="space-y-4">
                      {invoices.map((invoice: any) => (
                        <div key={invoice.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold">#{invoice.invoice_number}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(invoice.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${invoice.total?.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">{invoice.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ClientPortal;
