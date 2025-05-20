
import { ArrowDownIcon, ArrowUpIcon, Calendar, DollarSign, Users, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { clients } from "@/data/real-clients";
import { jobs } from "@/data/real-jobs";
import { useEffect, useState } from "react";

export const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  
  useEffect(() => {
    // Calculate real metrics from clients and jobs data
    const activeClients = clients.filter(client => client.status === "active").length;
    const completedJobs = jobs.filter(job => job.status === "completed");
    const totalRevenue = completedJobs.reduce((sum, job) => sum + job.revenue, 0);
    const openJobs = jobs.filter(job => job.status === "in-progress").length;
    const scheduledJobs = jobs.filter(job => job.status === "scheduled").length;
    
    // Set metrics with real data
    const calculatedMetrics = [
      {
        id: 1, 
        name: 'Revenue', 
        value: `$${totalRevenue.toLocaleString()}`, 
        change: 12, 
        isPositive: true,
        period: 'vs last month',
        icon: DollarSign,
        iconColor: "bg-fixlyfy"
      },
      {
        id: 2, 
        name: 'Active Clients', 
        value: activeClients.toString(), 
        change: 5, 
        isPositive: true,
        period: 'vs last month',
        icon: Users,
        iconColor: "bg-fixlyfy-success"
      },
      {
        id: 3, 
        name: 'Open Jobs', 
        value: openJobs.toString(), 
        change: 3, 
        isPositive: false,
        period: 'vs last month',
        icon: ListTodo,
        iconColor: "bg-fixlyfy-warning"
      },
      {
        id: 4, 
        name: 'Scheduled Jobs', 
        value: scheduledJobs.toString(), 
        change: 2, 
        isPositive: true,
        period: 'vs last month',
        icon: Calendar,
        iconColor: "bg-fixlyfy-info"
      },
    ];
    
    setMetrics(calculatedMetrics);
  }, []);

  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Business Performance</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {metrics.map((metric) => (
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
        ))}
      </div>
    </div>
  );
};
