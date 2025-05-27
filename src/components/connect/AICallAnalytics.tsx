
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Bot, TrendingUp, Phone, Calendar, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface CallAnalyticsData {
  hourlyData: Array<{ hour: string; calls: number; appointments: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  dailyTrends: Array<{ date: string; calls: number; success_rate: number }>;
  appointmentConversion: {
    total: number;
    scheduled: number;
    rate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AICallAnalytics = () => {
  const [analytics, setAnalytics] = useState<CallAnalyticsData>({
    hourlyData: [],
    statusDistribution: [],
    dailyTrends: [],
    appointmentConversion: { total: 0, scheduled: 0, rate: 0 }
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const { data: callsData, error } = await supabase
        .from('amazon_connect_calls')
        .select('*')
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: false });

      if (error) throw error;

      if (callsData) {
        // Process hourly data
        const hourlyMap = new Map<string, { calls: number; appointments: number }>();
        
        // Process status distribution
        const statusMap = new Map<string, number>();
        
        // Process daily trends
        const dailyMap = new Map<string, { calls: number; appointments: number }>();

        callsData.forEach(call => {
          const callDate = new Date(call.started_at);
          const hour = callDate.getHours();
          const hourKey = `${hour}:00`;
          const dayKey = callDate.toISOString().split('T')[0];

          // Hourly data
          const hourData = hourlyMap.get(hourKey) || { calls: 0, appointments: 0 };
          hourData.calls += 1;
          if (call.appointment_scheduled) hourData.appointments += 1;
          hourlyMap.set(hourKey, hourData);

          // Status distribution
          statusMap.set(call.call_status, (statusMap.get(call.call_status) || 0) + 1);

          // Daily trends
          const dayData = dailyMap.get(dayKey) || { calls: 0, appointments: 0 };
          dayData.calls += 1;
          if (call.appointment_scheduled) dayData.appointments += 1;
          dailyMap.set(dayKey, dayData);
        });

        // Convert to arrays
        const hourlyData = Array.from(hourlyMap.entries())
          .map(([hour, data]) => ({ hour, ...data }))
          .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

        const statusDistribution = Array.from(statusMap.entries())
          .map(([name, value], index) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: COLORS[index % COLORS.length]
          }));

        const dailyTrends = Array.from(dailyMap.entries())
          .map(([date, data]) => ({
            date: new Date(date).toLocaleDateString(),
            calls: data.calls,
            success_rate: data.calls > 0 ? Math.round((data.appointments / data.calls) * 100) : 0
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Appointment conversion
        const totalCalls = callsData.length;
        const scheduledAppointments = callsData.filter(call => call.appointment_scheduled).length;
        const appointmentConversion = {
          total: totalCalls,
          scheduled: scheduledAppointments,
          rate: totalCalls > 0 ? Math.round((scheduledAppointments / totalCalls) * 100) : 0
        };

        setAnalytics({
          hourlyData,
          statusDistribution,
          dailyTrends,
          appointmentConversion
        });
      }
    } catch (error) {
      console.error("Error fetching call analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Set up real-time sync
  useRealtimeSync({
    tables: ['amazon_connect_calls'],
    onUpdate: fetchAnalytics,
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">AI Call Analytics</h2>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold">{analytics.appointmentConversion.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Appointments Scheduled</p>
                <p className="text-2xl font-bold">{analytics.appointmentConversion.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.appointmentConversion.rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hourly Call Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3B82F6" name="Total Calls" />
                <Bar dataKey="appointments" fill="#10B981" name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Call Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Call Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Daily Trends & Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="calls" fill="#3B82F6" name="Daily Calls" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="success_rate" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
