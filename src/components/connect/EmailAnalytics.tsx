
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Mail, MailOpen, MousePointer, TrendingUp, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface EmailMetrics {
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface EmailAnalyticsData {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
}

export const EmailAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['email-analytics', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Get email analytics data
      const { data: analyticsData, error } = await supabase
        .from('email_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data for metrics
      const sentEmails = analyticsData?.filter(item => item.event_type === 'sent').length || 0;
      const openedEmails = analyticsData?.filter(item => item.event_type === 'open').length || 0;
      const clickedEmails = analyticsData?.filter(item => item.event_type === 'click').length || 0;

      const metrics: EmailMetrics = {
        sent: sentEmails,
        opened: openedEmails,
        clicked: clickedEmails,
        openRate: sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0,
        clickRate: sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0
      };

      // Process data for charts
      const dailyData: { [key: string]: { sent: number; opened: number; clicked: number } } = {};
      
      analyticsData?.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { sent: 0, opened: 0, clicked: 0 };
        }
        
        if (item.event_type === 'sent') dailyData[date].sent++;
        else if (item.event_type === 'open') dailyData[date].opened++;
        else if (item.event_type === 'click') dailyData[date].clicked++;
      });

      const chartData: EmailAnalyticsData[] = Object.entries(dailyData).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        ...data
      }));

      return { metrics, chartData };
    }
  });

  if (isLoading) {
    return <div>Loading email analytics...</div>;
  }

  const { metrics: emailMetrics, chartData } = metrics || { metrics: null, chartData: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Analytics
        </h3>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{emailMetrics?.sent || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Opened</p>
                <p className="text-2xl font-bold">{emailMetrics?.opened || 0}</p>
              </div>
              <MailOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Links Clicked</p>
                <p className="text-2xl font-bold">{emailMetrics?.clicked || 0}</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{emailMetrics?.openRate?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{emailMetrics?.clickRate?.toFixed(1) || 0}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                <Bar dataKey="opened" fill="#10b981" name="Opened" />
                <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Opens"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicked" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Open Rate Performance</p>
                <p className="text-sm text-green-600">
                  {emailMetrics?.openRate && emailMetrics.openRate > 20 ? 
                    'Above industry average (20%)' : 
                    'Below industry average (20%)'
                  }
                </p>
              </div>
              <Badge variant={emailMetrics?.openRate && emailMetrics.openRate > 20 ? 'default' : 'secondary'}>
                {emailMetrics?.openRate && emailMetrics.openRate > 20 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Click Rate Performance</p>
                <p className="text-sm text-blue-600">
                  {emailMetrics?.clickRate && emailMetrics.clickRate > 3 ? 
                    'Above industry average (3%)' : 
                    'Below industry average (3%)'
                  }
                </p>
              </div>
              <Badge variant={emailMetrics?.clickRate && emailMetrics.clickRate > 3 ? 'default' : 'secondary'}>
                {emailMetrics?.clickRate && emailMetrics.clickRate > 3 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
