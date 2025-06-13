
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award, 
  Mail, 
  MessageSquare,
  Download,
  Calendar,
  Trophy,
  Target,
  Zap,
  Bell
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

interface WarrantyMetrics {
  totalRevenue: number;
  conversionRate: number;
  averageValue: number;
  topTechnician: {
    name: string;
    sales: number;
    revenue: number;
    conversionRate: number;
  };
  topProduct: {
    name: string;
    sales: number;
    revenue: number;
  };
  channelPerformance: {
    email: { sales: number; conversion: number; revenue: number };
    sms: { sales: number; conversion: number; revenue: number };
  };
  monthlyTrend: Array<{
    month: string;
    sales: number;
    revenue: number;
    conversionRate: number;
  }>;
  technicianLeaderboard: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    conversionRate: number;
    commission: number;
    badge: string;
  }>;
  warrantyDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dailyConversions: Array<{
    date: string;
    rate: number;
  }>;
  timeHeatmap: Array<{
    hour: number;
    day: string;
    sales: number;
  }>;
}

export const WarrantyAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<WarrantyMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'milestone' | 'alert';
    message: string;
    timestamp: string;
  }>>([]);

  // Mock data - would be replaced with actual API calls
  useEffect(() => {
    const loadMetrics = () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMetrics({
          totalRevenue: 47750,
          conversionRate: 68.5,
          averageValue: 285,
          topTechnician: {
            name: "Mike Johnson",
            sales: 24,
            revenue: 8400,
            conversionRate: 72.3
          },
          topProduct: {
            name: "Extended HVAC Warranty Plus",
            sales: 18,
            revenue: 7200
          },
          channelPerformance: {
            email: { sales: 32, conversion: 72.3, revenue: 11200 },
            sms: { sales: 19, conversion: 64.1, revenue: 6650 }
          },
          monthlyTrend: [
            { month: "Jan", sales: 18, revenue: 6300, conversionRate: 65.2 },
            { month: "Feb", sales: 24, revenue: 8400, conversionRate: 68.1 },
            { month: "Mar", sales: 31, revenue: 10850, conversionRate: 71.4 },
            { month: "Apr", sales: 28, revenue: 9800, conversionRate: 69.8 },
            { month: "May", sales: 35, revenue: 12250, conversionRate: 74.2 }
          ],
          technicianLeaderboard: [
            { id: "1", name: "Mike Johnson", sales: 24, revenue: 8400, conversionRate: 72.3, commission: 840, badge: "Gold" },
            { id: "2", name: "Sarah Wilson", sales: 19, revenue: 6650, conversionRate: 68.9, commission: 665, badge: "Silver" },
            { id: "3", name: "David Chen", sales: 15, revenue: 5250, conversionRate: 65.4, commission: 525, badge: "Bronze" },
            { id: "4", name: "Lisa Rodriguez", sales: 12, revenue: 4200, conversionRate: 62.1, commission: 420, badge: "Rising Star" }
          ],
          warrantyDistribution: [
            { name: "HVAC Extended", value: 35, color: "#8b5cf6" },
            { name: "Plumbing Protection", value: 25, color: "#06b6d4" },
            { name: "Electrical Safety", value: 20, color: "#10b981" },
            { name: "Appliance Care", value: 15, color: "#f59e0b" },
            { name: "Home System", value: 5, color: "#ef4444" }
          ],
          dailyConversions: [
            { date: "Mon", rate: 68.2 }, { date: "Tue", rate: 71.5 }, { date: "Wed", rate: 69.8 },
            { date: "Thu", rate: 74.1 }, { date: "Fri", rate: 72.3 }, { date: "Sat", rate: 65.9 }, { date: "Sun", rate: 58.7 }
          ],
          timeHeatmap: [
            { hour: 9, day: "Mon", sales: 3 }, { hour: 10, day: "Mon", sales: 5 }, { hour: 11, day: "Mon", sales: 4 },
            { hour: 14, day: "Tue", sales: 6 }, { hour: 15, day: "Wed", sales: 7 }, { hour: 16, day: "Thu", sales: 5 }
          ]
        });
        
        // Mock notifications
        setNotifications([
          { id: "1", type: "success", message: "Mike Johnson just sold a $450 Extended HVAC Warranty!", timestamp: "2 min ago" },
          { id: "2", type: "milestone", message: "Team hit 70% conversion rate milestone!", timestamp: "1 hour ago" },
          { id: "3", type: "alert", message: "Weekly warranty revenue goal 85% complete", timestamp: "3 hours ago" }
        ]);
        
        setIsLoading(false);
      }, 1000);
    };

    loadMetrics();
  }, [timeRange]);

  const exportToPDF = () => {
    console.log("Exporting warranty analytics report to PDF...");
  };

  const exportToExcel = () => {
    console.log("Exporting warranty data to Excel...");
  };

  const exportToCSV = () => {
    console.log("Exporting warranty data to CSV...");
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Warranty Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive warranty upsell performance metrics</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Real-time Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Warranty Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {notification.type === 'success' && <Zap className="h-4 w-4 text-green-600" />}
                  {notification.type === 'milestone' && <Trophy className="h-4 w-4 text-yellow-600" />}
                  {notification.type === 'alert' && <Target className="h-4 w-4 text-blue-600" />}
                  <span className="text-sm">{notification.message}</span>
                </div>
                <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+28% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mt-2">+5.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageValue)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-2">+12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Technician</p>
                <p className="text-lg font-bold">{metrics.topTechnician.name}</p>
                <p className="text-sm text-muted-foreground">{metrics.topTechnician.sales} sales</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">{formatCurrency(metrics.topTechnician.revenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Product</p>
                <p className="text-sm font-bold truncate">{metrics.topProduct.name}</p>
                <p className="text-sm text-muted-foreground">{metrics.topProduct.sales} sales</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Warranty Sales by Technician</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: { label: "Sales", color: "#8b5cf6" },
                revenue: { label: "Revenue", color: "#06b6d4" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.technicianLeaderboard}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sales" fill="#8b5cf6" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Daily Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rate: { label: "Conversion Rate", color: "#10b981" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.dailyConversions}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warranty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Warranty Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Sales", color: "#f59e0b" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.warrantyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {metrics.warrantyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Warranty Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "#06b6d4" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Technician Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Technician Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.technicianLeaderboard.map((tech, index) => (
              <div key={tech.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{tech.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{tech.badge}</Badge>
                      <span className="text-sm text-muted-foreground">{tech.conversionRate}% conversion</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{tech.sales} sales</p>
                  <p className="text-sm text-green-600">{formatCurrency(tech.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Commission: {formatCurrency(tech.commission)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Email</span>
                <Badge variant="secondary">{metrics.channelPerformance.email.conversion}% conversion</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sales</span>
                  <span className="font-semibold">{metrics.channelPerformance.email.sales}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revenue</span>
                  <span className="font-semibold">{formatCurrency(metrics.channelPerformance.email.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.channelPerformance.email.sales / 51) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="font-semibold">SMS</span>
                <Badge variant="secondary">{metrics.channelPerformance.sms.conversion}% conversion</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sales</span>
                  <span className="font-semibold">{metrics.channelPerformance.sms.sales}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revenue</span>
                  <span className="font-semibold">{formatCurrency(metrics.channelPerformance.sms.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.channelPerformance.sms.sales / 51) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Best Time to Sell</p>
              <p className="text-xs text-muted-foreground">Thursdays 2-4 PM show highest conversion</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium">Top Client Segment</p>
              <p className="text-xs text-muted-foreground">Commercial clients 85% more likely to buy</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium">ROI Impact</p>
              <p className="text-xs text-muted-foreground">Warranty program adds 34% to job value</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏆 Goals & Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Target</span>
                <span className="font-semibold">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Conversion Goal</span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={exportToPDF} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF Report
            </Button>
            <Button onClick={exportToExcel} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Excel Export
            </Button>
            <Button onClick={exportToCSV} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
