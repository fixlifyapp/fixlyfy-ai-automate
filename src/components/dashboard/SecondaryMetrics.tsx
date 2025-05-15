
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, Users, DollarSign, Star } from "lucide-react";

export const SecondaryMetrics = () => {
  // Mock data for secondary metrics
  const metrics = [
    {
      id: 1,
      name: "Completion Rate",
      value: 92,
      icon: CheckCircle,
      description: "Jobs completed on time",
      change: "+5% vs last month",
      color: "text-fixlyfy-success"
    },
    {
      id: 2,
      name: "Average Job Value",
      value: "$245",
      icon: DollarSign,
      description: "Per completed job",
      change: "+$18 vs last month",
      color: "text-fixlyfy"
    },
    {
      id: 3,
      name: "Technician Utilization",
      value: 84,
      icon: Users,
      description: "Scheduled hours ratio",
      change: "+2% vs last month",
      color: "text-fixlyfy-info"
    },
    {
      id: 4,
      name: "Customer Satisfaction",
      value: 4.8,
      icon: Star,
      description: "Average rating",
      change: "+0.2 vs last month",
      color: "text-fixlyfy-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.id} className="animate-fade-in" style={{ animationDelay: `${metric.id * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            <metric.icon className={cn("h-4 w-4", metric.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {typeof metric.value === 'number' ? 
                <>
                  {metric.value}
                  {metric.name.includes("Satisfaction") ? <span className="text-sm ml-1">/ 5</span> : "%"}
                </> : 
                metric.value
              }
            </div>
            <p className="text-xs text-fixlyfy-text-secondary mb-2">{metric.description}</p>
            {typeof metric.value === 'number' && metric.value !== 4.8 && (
              <Progress 
                value={metric.value} 
                className={cn(
                  "h-1.5",
                  metric.value > 90 ? "bg-fixlyfy-success/20" : 
                  metric.value > 80 ? "bg-fixlyfy-info/20" : 
                  "bg-fixlyfy-warning/20"
                )}
              />
            )}
            {metric.value === 4.8 && (
              <Progress 
                value={metric.value * 20} 
                className="h-1.5 bg-fixlyfy-warning/20"
              />
            )}
            <p className="text-xs mt-2 text-fixlyfy-success">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
