
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientPortal } from './ClientPortalProvider';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Calendar,
  FileText,
  CreditCard,
  User,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export function ClientPortalDashboard() {
  const { data, session, logout, refreshData } = useClientPortal();
  const [activeTab, setActiveTab] = useState('overview');

  if (!data || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'unpaid':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const totalOutstanding = data.invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.total - (inv.amount_paid || 0)), 0);

  const recentJobs = data.jobs.slice(0, 3);
  const recentInvoices = data.invoices.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {session.name}
              </h1>
              <p className="text-gray-600">{session.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Services</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.jobs.filter(job => !['completed', 'cancelled'].includes(job.status)).length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Outstanding Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalOutstanding)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.jobs.length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">{job.job_type}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(job.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </div>
                        </Badge>
                      </div>
                    ))}
                    {recentJobs.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No services yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(invoice.total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </div>
                        </Badge>
                      </div>
                    ))}
                    {recentInvoices.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No invoices yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.description}</p>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(job.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          {job.job_type}
                        </div>
                        {job.revenue && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(job.revenue)}
                          </div>
                        )}
                      </div>
                      
                      {job.address && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                          <MapPin className="h-4 w-4" />
                          {job.address}
                        </div>
                      )}
                    </div>
                  ))}
                  {data.jobs.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No services found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{invoice.invoice_number}</h3>
                          <p className="text-gray-600">{invoice.description}</p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount Paid</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(invoice.amount_paid || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Balance Due</p>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(invoice.total - (invoice.amount_paid || 0))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="h-4 w-4" />
                          Created: {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                        </div>
                        {invoice.due_date && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock className="h-4 w-4" />
                            Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                      
                      {invoice.status !== 'paid' && (
                        <div className="mt-4">
                          <Button size="sm" className="bg-fixlyfy hover:bg-fixlyfy/90">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {data.invoices.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No invoices found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{data.client?.name}</p>
                        <p className="text-sm text-gray-600">Client Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{data.client?.email}</p>
                        <p className="text-sm text-gray-600">Email Address</p>
                      </div>
                    </div>
                    
                    {data.client?.phone && (
                      <div className="flex items-center gap-3 mb-4">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{data.client.phone}</p>
                          <p className="text-sm text-gray-600">Phone Number</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {data.client?.address && (
                      <div className="flex items-start gap-3 mb-4">
                        <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {[
                              data.client.address,
                              data.client.city,
                              data.client.state,
                              data.client.zip
                            ].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">Service Address</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(data.client?.created_at), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">Client Since</p>
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
