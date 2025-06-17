
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, FileText, DollarSign, CheckCircle, Clock, AlertCircle, MessageCircle, Download, Settings, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortalData {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
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
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    job_type: string;
    date: string;
    description: string;
  }>;
  messages: Array<{
    id: string;
    subject: string;
    message: string;
    sender_type: string;
    sender_name: string;
    created_at: string;
    is_read: boolean;
  }>;
  documents: Array<{
    id: string;
    document_type: string;
    file_name: string;
    file_size: number;
    created_at: string;
    is_downloadable: boolean;
  }>;
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

export default function EnhancedClientPortal() {
  const { accessId } = useParams();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (accessId) {
      loadPortalData(accessId);
    }
  }, [accessId]);

  const loadPortalData = async (accessToken: string) => {
    try {
      setLoading(true);
      
      // First validate access
      const { data: validation, error: validationError } = await supabase.functions.invoke('validate-portal-access', {
        body: { accessToken }
      });

      if (validationError || !validation?.valid) {
        setError('Access denied or expired');
        return;
      }

      // Get enhanced portal data
      const { data: portalData, error: dataError } = await supabase.functions.invoke('enhanced-portal-data', {
        body: { accessToken }
      });

      if (dataError) {
        throw dataError;
      }
      
      if (portalData) {
        setData(portalData);
        toast.success(`Welcome to your portal, ${portalData.client.name}!`);
      } else {
        setError('Unable to load portal data');
      }
    } catch (err: any) {
      console.error('Portal data load error:', err);
      setError('Failed to load portal data');
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      draft: { color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> },
      sent: { color: "bg-blue-500", icon: <FileText className="h-3 w-3" /> },
      approved: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { color: "bg-red-500", icon: <AlertCircle className="h-3 w-3" /> },
      paid: { color: "bg-green-600", icon: <DollarSign className="h-3 w-3" /> },
      overdue: { color: "bg-red-600", icon: <AlertCircle className="h-3 w-3" /> },
      scheduled: { color: "bg-blue-500", icon: <CalendarDays className="h-3 w-3" /> },
      'in-progress': { color: "bg-yellow-500", icon: <Clock className="h-3 w-3" /> },
      completed: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || 'Invalid access link'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please contact our support team if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">Welcome, {data.client.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                <Shield className="h-3 w-3 mr-1" />
                Secure Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {data.permissions.view_estimates && <TabsTrigger value="estimates">Estimates</TabsTrigger>}
            {data.permissions.view_invoices && <TabsTrigger value="invoices">Invoices</TabsTrigger>}
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Client Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {data.client.address && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">
                        {[data.client.address, data.client.city, data.client.state, data.client.zip]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.permissions.view_estimates && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Estimates</p>
                        <p className="text-2xl font-bold">{data.estimates.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {data.permissions.view_invoices && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Invoices</p>
                        <p className="text-2xl font-bold">{data.invoices.length}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Jobs</p>
                      <p className="text-2xl font-bold">{data.jobs.length}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Messages</p>
                      <p className="text-2xl font-bold">{data.messages.length}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.job_type} • {formatDate(job.date)}</p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  ))}
                  
                  {data.jobs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {data.permissions.view_estimates && (
            <TabsContent value="estimates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Estimates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.estimates.length > 0 ? (
                    <div className="space-y-4">
                      {data.estimates.map((estimate) => (
                        <div key={estimate.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{estimate.title || `Estimate ${estimate.estimate_number}`}</h3>
                              <p className="text-sm text-gray-500">#{estimate.estimate_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatCurrency(estimate.total)}</p>
                              {getStatusBadge(estimate.status)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Created: {formatDate(estimate.created_at)}</span>
                            {estimate.valid_until && (
                              <span>Valid until: {formatDate(estimate.valid_until)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Estimates</h3>
                      <p className="text-gray-500">Your estimates will appear here when they're available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {data.permissions.view_invoices && (
            <TabsContent value="invoices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.invoices.length > 0 ? (
                    <div className="space-y-4">
                      {data.invoices.map((invoice) => (
                        <div key={invoice.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{invoice.title || `Invoice ${invoice.invoice_number}`}</h3>
                              <p className="text-sm text-gray-500">#{invoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatCurrency(invoice.total)}</p>
                              {getStatusBadge(invoice.status)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Created: {formatDate(invoice.created_at)}</span>
                            {invoice.due_date && (
                              <span>Due: {formatDate(invoice.due_date)}</span>
                            )}
                          </div>

                          {data.permissions.make_payments && invoice.status !== 'paid' && (
                            <div className="mt-3 pt-3 border-t">
                              <Button size="sm" className="w-full" disabled>
                                Pay Invoice (Coming Soon)
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices</h3>
                      <p className="text-gray-500">Your invoices will appear here when they're available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Service Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.jobs.length > 0 ? (
                  <div className="space-y-4">
                    {data.jobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-gray-500">{job.job_type}</p>
                            {job.description && (
                              <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(job.status)}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <span>Scheduled: {formatDate(job.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs</h3>
                    <p className="text-gray-500">Your service jobs will appear here when they're scheduled.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.messages.length > 0 ? (
                  <div className="space-y-4">
                    {data.messages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{message.subject || 'No Subject'}</h3>
                            <p className="text-sm text-gray-500">
                              From: {message.sender_name} ({message.sender_type})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(message.created_at)}</p>
                            {!message.is_read && (
                              <Badge variant="secondary" className="mt-1">Unread</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
                    <p className="text-gray-500">Your messages will appear here when available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.documents.length > 0 ? (
                  <div className="space-y-4">
                    {data.documents.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{document.file_name}</h3>
                            <p className="text-sm text-gray-500">
                              {document.document_type} • {(document.file_size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-sm text-gray-500">
                              Uploaded: {formatDate(document.created_at)}
                            </p>
                          </div>
                          
                          {document.is_downloadable && (
                            <Button size="sm" variant="outline" disabled>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
                    <p className="text-gray-500">Your documents will appear here when available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
