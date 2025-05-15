
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsOverviewProps {
  period: string;
}

const metrics = [
  {
    id: 1, 
    name: 'Total Revenue', 
    value: '$24,750', 
    change: 18, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 2, 
    name: 'Completed Jobs', 
    value: '78', 
    change: 12, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 3, 
    name: 'Average Job Value', 
    value: '$317', 
    change: 5, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 4, 
    name: 'Customer Satisfaction', 
    value: '4.8/5', 
    change: 0.2, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 5, 
    name: 'Scheduled Jobs', 
    value: '32', 
    change: 8, 
    isPositive: true,
    period: 'vs last month'
  },
  {
    id: 6, 
    name: 'Cancellation Rate', 
    value: '4.2%', 
    change: 0.8, 
    isPositive: false,
    period: 'vs last month'
  },
];

export const ReportsOverview = ({ period }: ReportsOverviewProps) => {
  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Key Metrics {period === 'month' ? 'This Month' : period === 'week' ? 'This Week' : period === 'quarter' ? 'This Quarter' : 'This Year'}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 p-6">
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
