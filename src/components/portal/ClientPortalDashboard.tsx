
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientPortal } from './ClientPortalProvider';
import { ClientPortalLogin } from './ClientPortalLogin';
import { Calendar, DollarSign, FileText, MapPin, Phone, Mail, User, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function ClientPortalDashboard() {
  const { session, data, isLoading, isAuthenticated, refreshData } = useClientPortal();

  useEffect(() => {
    if (isAuthenticated && !data) {
      refreshData();
    }
  }, [isAuthenticated, data, refreshData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ClientPortalLogin />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading your information...</p>
          <Button onClick={refreshData}>Retry</Button>
        </div>
      </div>
    );
  }

  const { client, jobs, estimates, invoices, payments } = data;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">Welcome back, {session?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900">{jobs?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Estimates</p>
                      <p className="text-2xl font-bold text-gray-900">{estimates?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{invoices?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Payments</p>
                      <p className="text-2xl font-bold text-gray-900">{payments?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Services */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Services</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.service}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.date ? format(new Date(job.date), 'MMM dd, yyyy') : 'No date set'}
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No services found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job: any) => (
                      <div key={job.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-gray-600 mt-1">{job.description}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {job.date ? format(new Date(job.date), 'MMM dd, yyyy') : 'No date set'}
                              {job.schedule_start && (
                                <span className="ml-4">
                                  <Clock className="h-4 w-4 mr-1 inline" />
                                  {format(new Date(job.schedule_start), 'h:mm a')}
                                </span>
                              )}
                            </div>
                            {job.address && (
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.address}
                              </div>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <Badge className={getStatusColor(job.status)}>
                              {job.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                            {job.revenue && (
                              <p className="text-lg font-semibold text-gray-900 mt-2">
                                ${job.revenue.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No services found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estimates */}
              <Card>
                <CardHeader>
                  <CardTitle>Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                  {estimates && estimates.length > 0 ? (
                    <div className="space-y-3">
                      {estimates.map((estimate: any) => (
                        <div key={estimate.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">#{estimate.estimate_number}</p>
                            <p className="text-sm text-gray-600">
                              {estimate.created_at ? format(new Date(estimate.created_at), 'MMM dd, yyyy') : 'No date'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(estimate.status)}>
                              {estimate.status}
                            </Badge>
                            <p className="font-semibold mt-1">${estimate.total?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No estimates found</p>
                  )}
                </CardContent>
              </Card>

              {/* Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices && invoices.length > 0 ? (
                    <div className="space-y-3">
                      {invoices.map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">#{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-600">
                              {invoice.issue_date ? format(new Date(invoice.issue_date), 'MMM dd, yyyy') : 'No date'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <p className="font-semibold mt-1">${invoice.total?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No invoices found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payments */}
            {payments && payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Payment #{payment.payment_number}</p>
                          <p className="text-sm text-gray-600">
                            {payment.payment_date ? format(new Date(payment.payment_date), 'MMM dd, yyyy') : 'No date'}
                          </p>
                          <p className="text-sm text-gray-500">{payment.method}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <p className="font-semibold mt-1">${payment.amount?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{client?.name || session?.name || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{client?.email || session?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{client?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <div className="font-medium">
                          {client?.address && (
                            <>
                              <p>{client.address}</p>
                              <p>
                                {client.city && `${client.city}, `}
                                {client.state} {client.zip}
                              </p>
                              {client.country && <p>{client.country}</p>}
                            </>
                          )}
                          {!client?.address && <p>No address on file</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
