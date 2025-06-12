
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
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WarrantyMetrics {
  totalRevenue: number;
  conversionRate: number;
  topTechnician: {
    name: string;
    sales: number;
    revenue: number;
  };
  topProduct: {
    name: string;
    sales: number;
    revenue: number;
  };
  emailVsSms: {
    email: { sales: number; conversion: number };
    sms: { sales: number; conversion: number };
  };
  monthlyTrend: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

export const WarrantyAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<WarrantyMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - would be replaced with actual API calls
  useEffect(() => {
    const loadMetrics = () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMetrics({
          totalRevenue: 15750,
          conversionRate: 68.5,
          topTechnician: {
            name: "Mike Johnson",
            sales: 12,
            revenue: 4200
          },
          topProduct: {
            name: "Extended HVAC Warranty",
            sales: 8,
            revenue: 3600
          },
          emailVsSms: {
            email: { sales: 15, conversion: 72.3 },
            sms: { sales: 9, conversion: 64.1 }
          },
          monthlyTrend: [
            { month: "Jan", sales: 8, revenue: 2800 },
            { month: "Feb", sales: 12, revenue: 4200 },
            { month: "Mar", sales: 15, revenue: 5250 },
            { month: "Apr", sales: 10, revenue: 3500 }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    loadMetrics();
  }, [timeRange]);

  const exportReport = () => {
    // Mock export functionality
    console.log("Exporting warranty analytics report...");
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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
        <h2 className="text-2xl font-bold">Warranty Analytics</h2>
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
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+23% from last period</p>
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
                <p className="text-lg font-bold truncate">{metrics.topProduct.name}</p>
                <p className="text-sm text-muted-foreground">{metrics.topProduct.sales} sales</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Email vs SMS Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Email</span>
                <Badge variant="secondary">{metrics.emailVsSms.email.conversion}% conversion</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sales</span>
                  <span className="font-semibold">{metrics.emailVsSms.email.sales}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.emailVsSms.email.sales / 24) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="font-semibold">SMS</span>
                <Badge variant="secondary">{metrics.emailVsSms.sms.conversion}% conversion</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sales</span>
                  <span className="font-semibold">{metrics.emailVsSms.sms.sales}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.emailVsSms.sms.sales / 24) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Warranty Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.monthlyTrend.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm w-12">{month.month}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(month.sales / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{month.sales} sales</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(month.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
