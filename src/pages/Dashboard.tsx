
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ArrowUpRight, 
  Calendar, 
  DollarSign, 
  Download, 
  FileText, 
  Mail, 
  Plus, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  User, 
  Users,
  Brain, 
  Clock,
  AlertTriangle,
  Star,
  CheckCircle
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-fixlyfy-text-secondary">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpiMetrics.map((metric) => (
          <div key={metric.title} className="fixlyfy-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("p-2 rounded-md", metric.bgColor)}>
                <metric.icon size={16} className="text-white" />
              </div>
              <span className="text-sm text-fixlyfy-text-secondary">{metric.title}</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{metric.value}</p>
              <div className="flex items-center mt-1">
                <div className={cn(
                  "flex items-center text-xs mr-2",
                  metric.trend > 0 ? "text-fixlyfy-success" : "text-fixlyfy-error"
                )}>
                  {metric.trend > 0 ? 
                    <TrendingUp size={12} className="mr-1" /> : 
                    <TrendingDown size={12} className="mr-1" />
                  }
                  {Math.abs(metric.trend)}%
                </div>
                <span className="text-xs text-fixlyfy-text-muted">vs. previous period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* AI Insights Panel */}
        <div className="fixlyfy-card">
          <div className="p-4 border-b border-fixlyfy-border flex items-center">
            <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center text-white mr-3">
              <Brain size={18} />
            </div>
            <h2 className="text-lg font-medium">AI Insights</h2>
          </div>
          <div className="p-4 space-y-3">
            {aiInsights.map((insight, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-3 rounded-md border",
                  insight.type === "warning" && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5",
                  insight.type === "info" && "border-fixlyfy-info/20 bg-fixlyfy-info/5",
                  insight.type === "success" && "border-fixlyfy-success/20 bg-fixlyfy-success/5"
                )}
              >
                <div className="flex items-start">
                  <div className={cn(
                    "p-1.5 rounded mr-2 mt-0.5",
                    insight.type === "warning" && "bg-fixlyfy-warning/20",
                    insight.type === "info" && "bg-fixlyfy-info/20",
                    insight.type === "success" && "bg-fixlyfy-success/20"
                  )}>
                    <insight.icon size={14} className={cn(
                      insight.type === "warning" && "text-fixlyfy-warning",
                      insight.type === "info" && "text-fixlyfy-info",
                      insight.type === "success" && "text-fixlyfy-success"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-fixlyfy-text-secondary mt-1">{insight.description}</p>
                    <Button 
                      variant="link" 
                      className={cn(
                        "p-0 h-auto text-xs mt-1",
                        insight.type === "warning" && "text-fixlyfy-warning",
                        insight.type === "info" && "text-fixlyfy-info",
                        insight.type === "success" && "text-fixlyfy-success"
                      )}
                    >
                      {insight.action} <ArrowRight size={10} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Charts */}
        <div className="fixlyfy-card lg:col-span-2">
          <div className="p-4 border-b border-fixlyfy-border">
            <h2 className="text-lg font-medium">Business Trends</h2>
          </div>
          <div className="p-4">
            <Tabs defaultValue="revenue">
              <TabsList className="mb-4">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="mt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => `$${value}`} 
                      />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Line 
                        type="monotone" 
                        dataKey="hvac" 
                        stroke="#8A4DD5" 
                        strokeWidth={2}
                        name="HVAC"
                        dot={{ fill: '#8A4DD5', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="plumbing" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Plumbing"
                        dot={{ fill: '#3B82F6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="electrical" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Electrical"
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="jobs" className="mt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" fill="#F59E0B" name="In Progress" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="scheduled" fill="#3B82F6" name="Scheduled" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="satisfaction" className="mt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={satisfactionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Satisfaction']} />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#8A4DD5" 
                        strokeWidth={3}
                        dot={{ fill: '#8A4DD5', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <ReferenceLine y={85} stroke="#F59E0B" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming & Overdue Jobs */}
        <div className="fixlyfy-card">
          <div className="p-4 border-b border-fixlyfy-border flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md mr-3 bg-fixlyfy-info flex items-center justify-center text-white">
                <Calendar size={18} />
              </div>
              <h2 className="text-lg font-medium">Upcoming Jobs</h2>
            </div>
            <Badge variant="outline" className="text-fixlyfy-text-secondary">5 jobs today</Badge>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {upcomingJobs.map((job, index) => (
              <div 
                key={job.id} 
                className={cn(
                  "p-4 border-b border-fixlyfy-border last:border-b-0",
                  job.isOverdue && "bg-fixlyfy-error/5"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{job.client}</h3>
                    <p className="text-xs text-fixlyfy-text-secondary">{job.address}</p>
                    <p className="text-xs text-fixlyfy-text-secondary mt-1">{job.service}</p>
                  </div>
                  <Badge className={cn(
                    job.status === "scheduled" && "bg-fixlyfy-info/10 text-fixlyfy-info",
                    job.status === "in-progress" && "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                    job.status === "overdue" && "bg-fixlyfy-error/10 text-fixlyfy-error",
                  )}>
                    {job.status === "scheduled" && "Scheduled"}
                    {job.status === "in-progress" && "In Progress"}
                    {job.status === "overdue" && "Overdue"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={job.tech.avatar} />
                      <AvatarFallback>{job.tech.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-fixlyfy-text-secondary">{job.time}</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-fixlyfy border-fixlyfy/20">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invoices & Payments */}
        <div className="fixlyfy-card">
          <div className="p-4 border-b border-fixlyfy-border">
            <h2 className="text-lg font-medium">Invoice Status</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="border border-fixlyfy-border rounded-md p-3 text-center">
                <p className="text-xs text-fixlyfy-text-secondary">Overdue</p>
                <p className="text-xl font-semibold text-fixlyfy-error">$5,240</p>
                <p className="text-xs text-fixlyfy-text-muted">7 invoices</p>
              </div>
              <div className="border border-fixlyfy-border rounded-md p-3 text-center">
                <p className="text-xs text-fixlyfy-text-secondary">Due Soon</p>
                <p className="text-xl font-semibold text-fixlyfy-warning">$3,180</p>
                <p className="text-xs text-fixlyfy-text-muted">5 invoices</p>
              </div>
              <div className="border border-fixlyfy-border rounded-md p-3 text-center">
                <p className="text-xs text-fixlyfy-text-secondary">Paid (30d)</p>
                <p className="text-xl font-semibold text-fixlyfy-success">$12,450</p>
                <p className="text-xs text-fixlyfy-text-muted">23 invoices</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Recent Invoices</h3>
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-2 border border-fixlyfy-border rounded-md">
                  <div>
                    <p className="text-sm font-medium">{invoice.client}</p>
                    <p className="text-xs text-fixlyfy-text-muted">{invoice.id} • {invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${invoice.amount}</p>
                    <Badge className={cn(
                      invoice.status === "paid" && "bg-fixlyfy-success/10 text-fixlyfy-success",
                      invoice.status === "overdue" && "bg-fixlyfy-error/10 text-fixlyfy-error",
                      invoice.status === "pending" && "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                    )}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-fixlyfy-info/5 border border-fixlyfy-info/20 rounded-md">
              <div className="flex items-start">
                <div className="p-1 bg-fixlyfy-info/20 rounded mr-2 mt-0.5">
                  <AlertTriangle size={14} className="text-fixlyfy-info" />
                </div>
                <div>
                  <p className="text-sm font-medium">Collection Tip</p>
                  <p className="text-xs text-fixlyfy-text-secondary mt-1">
                    Consider automatic follow-up for invoices older than 3 days to improve cash flow.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs mt-1 text-fixlyfy-info">
                    Setup Auto-Reminder <ArrowRight size={10} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Snapshot */}
        <div className="fixlyfy-card">
          <div className="p-4 border-b border-fixlyfy-border">
            <h2 className="text-lg font-medium">Team Performance</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Top Performers</h3>
              {topPerformers.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={tech.avatar} />
                      <AvatarFallback>{tech.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{tech.name}</p>
                      <div className="flex items-center text-fixlyfy-text-muted text-xs">
                        <Calendar size={12} className="mr-1" />
                        <span>{tech.completedJobs} jobs completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      <Star size={14} className="text-yellow-400 mr-1" />
                      <span className="font-medium">{tech.rating}</span>
                    </div>
                    <Badge className="bg-fixlyfy-success">Top</Badge>
                  </div>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Needs Coaching</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src="https://i.pravatar.cc/150?img=4" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">James Davis</p>
                      <div className="flex items-center text-fixlyfy-text-muted text-xs">
                        <AlertTriangle size={12} className="text-fixlyfy-error mr-1" />
                        <span>12% repeat visits</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      <Star size={14} className="text-yellow-400 mr-1" />
                      <span className="font-medium">3.6</span>
                    </div>
                    <Badge variant="outline" className="border-fixlyfy-warning text-fixlyfy-warning">
                      Focus
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-fixlyfy/5 border border-fixlyfy/20 rounded-md">
                <div className="flex items-start">
                  <div className="p-1 bg-fixlyfy/20 rounded mr-2 mt-0.5">
                    <Brain size={14} className="text-fixlyfy" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coaching Tip</p>
                    <p className="text-xs text-fixlyfy-text-secondary mt-1">
                      Consider pairing James with Robert for mentorship on HVAC diagnostics to reduce repeat visits.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-xs mt-1 text-fixlyfy">
                      Schedule Training <ArrowRight size={10} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions & Marketing Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Toolbar */}
        <div className="fixlyfy-card">
          <div className="p-4 border-b border-fixlyfy-border">
            <h2 className="text-lg font-medium">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <Button className="bg-fixlyfy hover:bg-fixlyfy/90 h-auto py-4 flex flex-col items-center">
              <Plus size={20} className="mb-1" />
              <span>Create New Job</span>
            </Button>
            <Button className="bg-fixlyfy-success hover:bg-fixlyfy-success/90 h-auto py-4 flex flex-col items-center">
              <User size={20} className="mb-1" />
              <span>Add Client</span>
            </Button>
            <Button className="bg-fixlyfy-info hover:bg-fixlyfy-info/90 h-auto py-4 flex flex-col items-center">
              <Mail size={20} className="mb-1" />
              <span>Send Mass Email</span>
            </Button>
            <Button className="bg-fixlyfy-warning hover:bg-fixlyfy-warning/90 h-auto py-4 flex flex-col items-center">
              <FileText size={20} className="mb-1" />
              <span>Generate Report</span>
            </Button>
          </div>
        </div>

        {/* Lead & Marketing Tracker */}
        <div className="fixlyfy-card lg:col-span-2">
          <div className="p-4 border-b border-fixlyfy-border">
            <h2 className="text-lg font-medium">Lead & Marketing Tracker</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Lead Sources (30 days)</h3>
              <div className="space-y-3">
                {leadSources.map((source) => (
                  <div key={source.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{source.name}</span>
                      <span className="font-medium">{source.count}</span>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View All Lead Data <ArrowUpRight size={14} className="ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Campaign ROI</h3>
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.name} className="p-3 border border-fixlyfy-border rounded-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <Badge className={campaign.roi > 0 ? "bg-fixlyfy-success" : "bg-fixlyfy-error"}>
                        {campaign.roi > 0 ? `+${campaign.roi}%` : `${campaign.roi}%`}
                      </Badge>
                    </div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-fixlyfy-text-secondary">Spend: ${campaign.spend}</span>
                      <span className="text-fixlyfy-text-secondary">Revenue: ${campaign.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Marketing Dashboard <ArrowUpRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

// Mock data for KPI metrics
const kpiMetrics = [
  {
    title: "Total Revenue",
    value: "$12,450",
    trend: 12,
    icon: DollarSign,
    bgColor: "bg-fixlyfy"
  },
  {
    title: "Completed Jobs",
    value: "38",
    trend: 8,
    icon: CheckCircle,
    bgColor: "bg-fixlyfy-success"
  },
  {
    title: "Open Jobs",
    value: "24",
    trend: -5,
    icon: Calendar,
    bgColor: "bg-fixlyfy-info"
  },
  {
    title: "Avg Response Time",
    value: "3.2h",
    trend: -15,
    icon: Clock,
    bgColor: "bg-fixlyfy-warning"
  },
  {
    title: "Client Satisfaction",
    value: "92%",
    trend: 4,
    icon: Star,
    bgColor: "bg-amber-500"
  },
  {
    title: "Cash Forecast",
    value: "$18.2k",
    trend: 9,
    icon: TrendingUp,
    bgColor: "bg-emerald-600"
  }
];

// AI Insights data
const aiInsights = [
  {
    title: "Revenue Opportunity",
    description: "HVAC revenue is down 18% compared to last month. Consider a targeted promotion.",
    type: "warning",
    action: "Create Promotion",
    icon: AlertTriangle
  },
  {
    title: "Scheduling Optimization",
    description: "3 technicians are underutilized next week. Optimize your schedule.",
    type: "info",
    action: "Optimize Schedule",
    icon: Clock
  },
  {
    title: "Customer Satisfaction",
    description: "Customer ratings improved by 12% this month. Great job!",
    type: "success",
    action: "View Details",
    icon: Star
  }
];

// Revenue data for trend chart
const revenueData = [
  { name: 'Jan', hvac: 4000, plumbing: 2400, electrical: 1400 },
  { name: 'Feb', hvac: 3000, plumbing: 1398, electrical: 2210 },
  { name: 'Mar', hvac: 2000, plumbing: 9800, electrical: 2290 },
  { name: 'Apr', hvac: 2780, plumbing: 3908, electrical: 2000 },
  { name: 'May', hvac: 1890, plumbing: 4800, electrical: 2181 },
  { name: 'Jun', hvac: 2390, plumbing: 3800, electrical: 2500 },
  { name: 'Jul', hvac: 3490, plumbing: 4300, electrical: 2100 },
];

// Jobs data for trend chart
const jobsData = [
  { name: 'Jan', completed: 40, inProgress: 12, scheduled: 24 },
  { name: 'Feb', completed: 30, inProgress: 15, scheduled: 18 },
  { name: 'Mar', completed: 20, inProgress: 10, scheduled: 38 },
  { name: 'Apr', completed: 27, inProgress: 14, scheduled: 39 },
  { name: 'May', completed: 18, inProgress: 12, scheduled: 48 },
  { name: 'Jun', completed: 23, inProgress: 10, scheduled: 38 },
  { name: 'Jul', completed: 34, inProgress: 15, scheduled: 43 },
];

// Satisfaction data for trend chart
const satisfactionData = [
  { name: 'Jan', rating: 85 },
  { name: 'Feb', rating: 83 },
  { name: 'Mar', rating: 88 },
  { name: 'Apr', rating: 86 },
  { name: 'May', rating: 91 },
  { name: 'Jun', rating: 89 },
  { name: 'Jul', rating: 92 },
];

// Upcoming jobs data
const upcomingJobs = [
  {
    id: 'JOB-1001',
    client: 'Michael Johnson',
    address: '123 Main St, Apt 45',
    service: 'HVAC Repair',
    status: 'scheduled',
    time: '1:30 PM Today',
    tech: {
      name: 'Robert Smith',
      avatar: 'https://i.pravatar.cc/150?img=1'
    }
  },
  {
    id: 'JOB-1002',
    client: 'Sarah Williams',
    address: '456 Oak Ave',
    service: 'Plumbing',
    status: 'in-progress',
    time: '2:45 PM Today',
    tech: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=2'
    }
  },
  {
    id: 'JOB-1003',
    client: 'Jessica Miller',
    address: '321 Elm St',
    service: 'HVAC Maintenance',
    status: 'scheduled',
    time: 'Tomorrow, 9:00 AM',
    tech: {
      name: 'Robert Smith',
      avatar: 'https://i.pravatar.cc/150?img=1'
    }
  },
  {
    id: 'JOB-1004',
    client: 'Thomas Anderson',
    address: '789 Pine Rd',
    service: 'Electrical',
    status: 'overdue',
    isOverdue: true,
    time: 'Yesterday, 3:00 PM',
    tech: {
      name: 'Emily Clark',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  },
  {
    id: 'JOB-1005',
    client: 'Jennifer Lopez',
    address: '567 Maple St',
    service: 'Plumbing',
    status: 'scheduled',
    time: 'Tomorrow, 2:30 PM',
    tech: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=2'
    }
  },
];

// Recent invoices data
const recentInvoices = [
  {
    id: 'INV-1001',
    client: 'Michael Johnson',
    amount: '249.99',
    status: 'pending',
    date: 'Due in 5 days'
  },
  {
    id: 'INV-1002',
    client: 'Sarah Williams',
    amount: '589.00',
    status: 'overdue',
    date: '3 days overdue'
  },
  {
    id: 'INV-1003',
    client: 'David Brown',
    amount: '329.50',
    status: 'paid',
    date: 'Paid yesterday'
  },
  {
    id: 'INV-1004',
    client: 'Thomas Anderson',
    amount: '899.95',
    status: 'pending',
    date: 'Due tomorrow'
  }
];

// Top performing technicians
const topPerformers = [
  {
    id: 1,
    name: 'Robert Smith',
    avatar: 'https://i.pravatar.cc/150?img=1',
    completedJobs: 45,
    rating: 4.9
  },
  {
    id: 2,
    name: 'Emily Clark',
    avatar: 'https://i.pravatar.cc/150?img=5',
    completedJobs: 38,
    rating: 4.8
  },
  {
    id: 3,
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=2',
    completedJobs: 32,
    rating: 4.7
  }
];

// Lead source data
const leadSources = [
  { name: 'Website Form', count: 42, percentage: 42 },
  { name: 'Google Ads', count: 28, percentage: 28 },
  { name: 'Referrals', count: 18, percentage: 18 },
  { name: 'Social Media', count: 12, percentage: 12 }
];

// Campaign ROI data
const campaigns = [
  { name: 'Summer HVAC Promo', spend: 1200, revenue: 4800, roi: 300 },
  { name: 'Google Local Service Ads', spend: 850, revenue: 3150, roi: 270 },
  { name: 'Facebook Plumbing Ads', spend: 600, revenue: 450, roi: -25 }
];
