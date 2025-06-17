
import { useState } from 'react';
import { useClientPortal } from './ClientPortalProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, LogOut, RefreshCw, FileText, CreditCard, Calendar, Activity, Download, Eye, Menu, X } from 'lucide-react';

function MobileDocumentCard({ title, number, date, amount, status, type, onView, onDownload }: {
  title: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  type: 'estimate' | 'invoice';
  onView: () => void;
  onDownload?: () => void;
}) {
  const statusColor = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800';

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{number}</CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">{title}</p>
          </div>
          <Badge className={`${statusColor} text-xs shrink-0`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-blue-600">
                ${amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onView} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {onDownload && (
              <Button size="sm" variant="outline" onClick={onDownload} className="flex-1">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MobileClientPortal() {
  const { session, data, isLoading, isAuthenticated, error, logout, refreshData } = useClientPortal();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authenticating...
            </h3>
            <p className="text-gray-600 text-center text-sm">
              Please wait while we verify your access
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 text-sm">
              {error || 'Unable to authenticate your access. The link may be expired or invalid.'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/client-portal'} 
                variant="outline"
                className="w-full"
              >
                Return to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Mobile Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    Welcome, {session.name?.split(' ')[0]}
                  </h1>
                  <p className="text-xs text-gray-600 truncate">{session.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={refreshData}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Mobile Tab Navigation */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1">
              <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
                <TabsTrigger 
                  value="overview" 
                  className="flex flex-col items-center gap-1 py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="estimates" 
                  className="flex flex-col items-center gap-1 py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Estimates</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="invoices" 
                  className="flex flex-col items-center gap-1 py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Invoices</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs" 
                  className="flex flex-col items-center gap-1 py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Jobs</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Total Jobs</p>
                        <p className="text-2xl font-bold text-blue-600">{data?.jobs?.length || 0}</p>
                      </div>
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Estimates</p>
                        <p className="text-2xl font-bold text-green-600">{data?.estimates?.length || 0}</p>
                      </div>
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Outstanding</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ${data?.invoices?.reduce((sum: number, inv: any) => sum + (inv.total - (inv.amount_paid || 0)), 0)?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Activity className="h-4 w-4" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.activities && data.activities.length > 0 ? (
                    <div className="space-y-3">
                      {data.activities.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
                          <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estimates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Your Estimates</h2>
              </div>
              
              {data?.estimates && data.estimates.length > 0 ? (
                <div className="space-y-4">
                  {data.estimates.map((estimate: any) => (
                    <MobileDocumentCard
                      key={estimate.id}
                      type="estimate"
                      title={estimate.title || 'Service Estimate'}
                      number={estimate.estimate_number}
                      date={estimate.created_at}
                      amount={estimate.total || 0}
                      status={estimate.status}
                      onView={() => console.log('View estimate', estimate.id)}
                      onDownload={() => console.log('Download estimate', estimate.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No estimates available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Your Invoices</h2>
              </div>
              
              {data?.invoices && data.invoices.length > 0 ? (
                <div className="space-y-4">
                  {data.invoices.map((invoice: any) => (
                    <MobileDocumentCard
                      key={invoice.id}
                      type="invoice"
                      title={invoice.title || 'Service Invoice'}
                      number={invoice.invoice_number}
                      date={invoice.created_at}
                      amount={invoice.total || 0}
                      status={invoice.status}
                      onView={() => console.log('View invoice', invoice.id)}
                      onDownload={() => console.log('Download invoice', invoice.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Your Jobs</h2>
              </div>
              
              {data?.jobs && data.jobs.length > 0 ? (
                <div className="space-y-4">
                  {data.jobs.map((job: any) => (
                    <Card key={job.id} className="bg-white/70 backdrop-blur-sm border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold">{job.title}</CardTitle>
                            <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                          </div>
                          <Badge className={
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Scheduled Date</p>
                            <p className="text-sm font-medium">
                              {job.date ? new Date(job.date).toLocaleDateString() : 'Not scheduled'}
                            </p>
                          </div>
                          {job.revenue && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Value</p>
                              <p className="text-lg font-bold text-green-600">
                                ${job.revenue.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No jobs scheduled</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return null;
}
