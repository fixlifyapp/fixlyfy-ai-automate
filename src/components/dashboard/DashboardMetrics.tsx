
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const metrics = [
  {
    id: 1, 
    name: 'Revenue', 
    value: '$12,450', 
    change: 12, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 2, 
    name: 'Completed Jobs', 
    value: '48', 
    change: 8, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 3, 
    name: 'Customer Rating', 
    value: '4.8/5', 
    change: 0.2, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 4, 
    name: 'Pending Jobs', 
    value: '12', 
    change: 3, 
    isPositive: false,
    period: 'vs last month'
  },
];

export const DashboardMetrics = () => {
  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Business Performance</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="animate-fade-in" style={{ animationDelay: `${metric.id * 100}ms` }}>
            <p className="text-fixlyfy-text-secondary text-sm">{metric.name}</p>
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
