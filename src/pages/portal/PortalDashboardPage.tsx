
import React from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';

const PortalDashboardPage = () => {
  const { user } = useClientPortalAuth();

  const quickStats = [
    {
      title: "Active Estimates",
      value: "3",
      description: "Pending your review",
      icon: FileText,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Outstanding Invoices", 
      value: "2",
      description: "Total due: $1,250",
      icon: CreditCard,
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Scheduled Jobs",
      value: "1",
      description: "This week",
      icon: Clock,
      color: "bg-orange-100 text-orange-800"
    },
    {
      title: "Completed Jobs",
      value: "12",
      description: "This year",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800"
    }
  ];

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your service requests and account status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest service updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    HVAC Maintenance - Job #12345
                  </p>
                  <p className="text-sm text-gray-500">Completed 2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Badge className="bg-blue-100 text-blue-800">Estimate Sent</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Plumbing Repair - EST #EST-2024-001
                  </p>
                  <p className="text-sm text-gray-500">Sent 3 days ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Badge className="bg-orange-100 text-orange-800">Scheduled</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Electrical Inspection - Job #12346
                  </p>
                  <p className="text-sm text-gray-500">Scheduled for tomorrow</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <a href="/portal/estimates" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">View Estimates</p>
                    <p className="text-sm text-gray-500">Review and approve estimates</p>
                  </div>
                </a>
                
                <a href="/portal/invoices" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <CreditCard className="h-5 w-5 mr-3 text-green-500" />
                  <div>
                    <p className="font-medium">Pay Invoices</p>
                    <p className="text-sm text-gray-500">View and pay outstanding invoices</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalDashboardPage;
