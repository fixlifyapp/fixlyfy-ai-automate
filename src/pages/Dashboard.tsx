
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, Calendar, DollarSign, Users, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Define colors for charts
const COLORS = ['#8A4DD5', '#B084F9', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#E5E7EB'];

// Custom tooltip component for pie charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-fixlyfy-border rounded shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    clientCount: 0,
    jobCount: 0,
    revenue: 0,
    completionRate: 0,
    metrics: [],
    serviceData: [],
    satisfactionData: [],
    recentJobs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch clients data
        const { count: clientCount, error: clientError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
          
        if (clientError) throw clientError;
        
        // Fetch jobs data
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, client_id, status, revenue, date, clients(name)');
          
        if (jobsError) throw jobsError;
        
        // Calculate stats from jobs data
        const totalJobs = jobs?.length || 0;
        const completedJobs = jobs?.filter(job => job.status === 'completed')?.length || 0;
        const totalRevenue = jobs?.reduce((sum, job) => {
          const revenue = typeof job.revenue === 'number' ? job.revenue : parseFloat(job.revenue || '0');
          return sum + (isNaN(revenue) ? 0 : revenue);
        }, 0) || 0;
        const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
        
        // Group jobs by service/tags for the pie chart
        const serviceCounts: Record<string, number> = {};
        let totalServiceCount = 0;
        
        (jobs || []).forEach(job => {
          if (job.tags && job.tags.length > 0) {
            job.tags.forEach((tag: string) => {
              if (!serviceCounts[tag]) {
                serviceCounts[tag] = 0;
              }
              serviceCounts[tag]++;
              totalServiceCount++;
            });
          } else if (job.service) {
            if (!serviceCounts[job.service]) {
              serviceCounts[job.service] = 0;
            }
            serviceCounts[job.service]++;
            totalServiceCount++;
          } else {
            if (!serviceCounts["Other"]) {
              serviceCounts["Other"] = 0;
            }
            serviceCounts["Other"]++;
            totalServiceCount++;
          }
        });
        
        // Convert to percentage and format for chart
        const serviceChartData = Object.entries(serviceCounts)
          .map(([name, count], index) => ({
            name,
            value: Math.round((count / Math.max(totalServiceCount, 1)) * 100),
            color: COLORS[index % COLORS.length]
          }))
          .filter(item => item.value > 0) // Only include non-zero items
          .sort((a, b) => b.value - a.value); // Sort by value desc
          
        // Since we don't have satisfaction data yet, generate mock data
        const satisfactionData = [
          { name: 'Very Satisfied', value: 62, color: '#10B981' },
          { name: 'Satisfied', value: 28, color: '#3B82F6' },
          { name: 'Neutral', value: 7, color: '#F59E0B' },
          { name: 'Unsatisfied', value: 3, color: '#EF4444' }
        ];
        
        // Get recent jobs
        const recentJobs = jobs?.slice(0, 5).map(job => ({
          id: job.id,
          title: job.title,
          clientName: job.clients?.name || 'Unknown Client',
          status: job.status,
          date: job.date
        })) || [];
        
        // Calculate month-over-month changes (mocked for now)
        const getChangePercent = (value: number, base: number) => {
          return Math.round(((value - base) / Math.max(base, 1)) * 100) || 0;
        };
        
        // Create metrics for the dashboard
        const metrics = [
          {
            id: 1, 
            name: 'Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: getChangePercent(totalRevenue, totalRevenue * 0.9), 
            isPositive: true,
            period: 'vs last month',
            icon: DollarSign,
            iconColor: "bg-fixlyfy"
          },
          {
            id: 2, 
            name: 'Active Clients', 
            value: clientCount?.toString() || '0', 
            change: 5, 
            isPositive: true,
            period: 'vs last month',
            icon: Users,
            iconColor: "bg-fixlyfy-success"
          },
          {
            id: 3, 
            name: 'Total Jobs', 
            value: totalJobs.toString(), 
            change: 3, 
            isPositive: true,
            period: 'vs last month',
            icon: ListTodo,
            iconColor: "bg-fixlyfy-warning"
          },
          {
            id: 4, 
            name: 'Completion Rate', 
            value: `${completionRate.toFixed(1)}%`, 
            change: 2, 
            isPositive: true,
            period: 'vs last month',
            icon: Calendar,
            iconColor: "bg-fixlyfy-info"
          },
        ];
        
        setDashboardData({
          clientCount: clientCount || 0,
          jobCount: totalJobs,
          revenue: totalRevenue,
          completionRate,
          metrics,
          serviceData: serviceChartData.length > 0 ? serviceChartData : [{ name: 'No Data', value: 100, color: '#E5E7EB' }],
          satisfactionData,
          recentJobs
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-fixlyfy-text-secondary">Welcome to your business overview</p>
      </div>
      
      {/* Business Metrics */}
      <div className="fixlyfy-card mb-6">
        <div className="p-6 border-b border-fixlyfy-border">
          <h2 className="text-lg font-medium">Business Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-gray-200 p-2 rounded h-6 w-6"></div>
                  <div className="bg-gray-200 h-4 w-24 rounded"></div>
                </div>
                <div className="bg-gray-200 h-8 w-28 my-1 rounded"></div>
                <div className="flex items-center">
                  <div className="bg-gray-200 h-4 w-12 mr-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-24 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            dashboardData.metrics.map((metric) => (
              <div key={metric.id} className="animate-fade-in" style={{ animationDelay: `${metric.id * 100}ms` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-2 rounded text-white", metric.iconColor)}>
                    <metric.icon size={16} />
                  </div>
                  <p className="text-fixlyfy-text-secondary text-sm">{metric.name}</p>
                </div>
                <p className="text-2xl font-semibold my-1">{metric.value}</p>
                <div className="flex items-center">
                  <div className={cn(
                    "flex items-center text-xs mr-2",
                    metric.isPositive ? "text-fixlyfy-success" : "text-fixlyfy-error"
                  )}>
                    {metric.isPositive ? 
                      <ArrowUpIcon size={12} className="mr-1" /> : 
                      <ArrowDownIcon size={12} className="mr-1" />
                    }
                    {metric.change}%
                  </div>
                  <span className="text-xs text-fixlyfy-text-secondary">{metric.period}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Service Breakdown */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="service">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="service">Service Categories</TabsTrigger>
                <TabsTrigger value="satisfaction">Customer Satisfaction</TabsTrigger>
              </TabsList>
              <TabsContent value="service" className="h-[300px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dashboardData.serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              <TabsContent value="satisfaction" className="h-[300px]">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.satisfactionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dashboardData.satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Secondary Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckIcon className="h-4 w-4 text-fixlyfy-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {isLoading ? 
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : 
                  `${dashboardData.completionRate.toFixed(1)}%`
                }
              </div>
              <p className="text-xs text-fixlyfy-text-secondary mb-2">Jobs completed successfully</p>
              {!isLoading && (
                <Progress 
                  value={dashboardData.completionRate} 
                  className={cn(
                    "h-1.5",
                    dashboardData.completionRate > 90 ? "bg-fixlyfy-success/20" : 
                    dashboardData.completionRate > 80 ? "bg-fixlyfy-info/20" : 
                    "bg-fixlyfy-warning/20"
                  )}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Job Value</CardTitle>
              <DollarSign className="h-4 w-4 text-fixlyfy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {isLoading ? 
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : 
                  `$${dashboardData.jobCount > 0 ? Math.round(dashboardData.revenue / dashboardData.jobCount).toLocaleString() : 0}`
                }
              </div>
              <p className="text-xs text-fixlyfy-text-secondary mb-2">Per completed job</p>
              {!isLoading && (
                <Progress 
                  value={Math.min(dashboardData.revenue / Math.max(dashboardData.jobCount, 1) / 10, 100)} 
                  className="h-1.5 bg-fixlyfy/20"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Recent Jobs */}
      <div className="fixlyfy-card">
        <div className="p-6 border-b border-fixlyfy-border">
          <h2 className="text-lg font-medium">Recent Jobs</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-fixlyfy-border last:border-0">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            dashboardData.recentJobs.length > 0 ? (
              dashboardData.recentJobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-fixlyfy-border last:border-0">
                  <div>
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="text-sm text-fixlyfy-text-secondary">{job.clientName}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    job.status === 'completed' ? 'bg-fixlyfy-success/20 text-fixlyfy-success' :
                    job.status === 'in_progress' ? 'bg-fixlyfy-info/20 text-fixlyfy-info' :
                    job.status === 'scheduled' ? 'bg-fixlyfy-warning/20 text-fixlyfy-warning' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-fixlyfy-text-secondary">
                <p>No recent jobs found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/jobs'}
                >
                  Create your first job
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
