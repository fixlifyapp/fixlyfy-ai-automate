
import { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Receipt, Briefcase, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface DashboardData {
  estimates: any[];
  invoices: any[];
  recentJobs: any[];
  stats: {
    totalEstimates: number;
    totalInvoices: number;
    pendingInvoices: number;
    totalOwed: number;
  };
}

export default function PortalDashboardPage() {
  const { user } = useClientPortalAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const sessionToken = localStorage.getItem('client_portal_session');
      if (!sessionToken) return;

      const { data, error } = await supabase.functions.invoke('client-portal-data', {
        body: {},
        headers: {
          'client-portal-session': sessionToken
        }
      });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return;
      }

      setDashboardData(data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <LoadingSkeleton />
      </PortalLayout>
    );
  }

  if (!dashboardData) {
    return (
      <PortalLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Unable to load dashboard data</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalEstimates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.pendingInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData.stats.totalOwed.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Projects
              </CardTitle>
              <CardDescription>Your latest service requests</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-600">
                          {job.schedule_start ? new Date(job.schedule_start).toLocaleDateString() : 'Not scheduled'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent projects</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Estimates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Estimates
              </CardTitle>
              <CardDescription>Latest estimates and quotes</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.estimates.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.estimates.slice(0, 5).map((estimate) => (
                    <div key={estimate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{estimate.estimate_number}</p>
                        <p className="text-sm text-gray-600">${estimate.total.toFixed(2)}</p>
                      </div>
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No estimates available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
