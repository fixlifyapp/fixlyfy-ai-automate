
import { useEffect, useState } from "react";
import { useClientPortalAuth } from "@/hooks/useClientPortalAuth";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, CreditCard, DollarSign, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalEstimates: number;
  pendingEstimates: number;
  totalInvoices: number;
  unpaidInvoices: number;
  totalOwed: number;
  notifications: any[];
}

export default function PortalDashboardPage() {
  const { user } = useClientPortalAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEstimates: 0,
    pendingEstimates: 0,
    totalInvoices: 0,
    unpaidInvoices: 0,
    totalOwed: 0,
    notifications: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch estimates
      const { data: estimates } = await supabase
        .from('estimates')
        .select('*')
        .in('job_id', 
          await supabase
            .from('jobs')
            .select('id')
            .eq('client_id', user.clientId)
            .then(res => res.data?.map(job => job.id) || [])
        );

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .in('job_id',
          await supabase
            .from('jobs')
            .select('id')
            .eq('client_id', user.clientId)
            .then(res => res.data?.map(job => job.id) || [])
        );

      // Fetch notifications
      const { data: notifications } = await supabase
        .from('client_notifications')
        .select('*')
        .eq('client_id', user.clientId)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalEstimates: estimates?.length || 0,
        pendingEstimates: estimates?.filter(e => e.status === 'draft' || e.status === 'sent').length || 0,
        totalInvoices: invoices?.length || 0,
        unpaidInvoices: invoices?.filter(i => i.status === 'unpaid').length || 0,
        totalOwed: invoices?.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + (i.total || 0), 0) || 0,
        notifications: notifications || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('client-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_notifications',
          filter: `client_id=eq.${user.clientId}`
        },
        (payload) => {
          setStats(prev => ({
            ...prev,
            notifications: [payload.new, ...prev.notifications.slice(0, 4)]
          }));
          toast.info('New notification received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('client_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setStats(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to your client portal</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEstimates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingEstimates} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unpaidInvoices} unpaid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Owed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalOwed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.notifications.filter(n => !n.is_read).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Unread messages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your documents and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/portal/estimates')}
              >
                <FileText className="h-6 w-6" />
                <span>View Estimates</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/portal/invoices')}
              >
                <CreditCard className="h-6 w-6" />
                <span>View Invoices</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/portal/profile')}
              >
                <Clock className="h-6 w-6" />
                <span>Update Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        {stats.notifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between p-3 rounded-lg border ${
                      notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
