
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface InsightItem {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  action?: string;
  actionUrl?: string;
  icon: React.ElementType;
}

export const AiInsightsPanel = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      
      // In a real application, these would come from an AI service
      // or from a backend endpoint that generates insights based on your business data
      // For now, we'll use mock data
      
      setTimeout(() => {
        const mockInsights: InsightItem[] = [
          {
            id: 1,
            title: 'Revenue Opportunity',
            description: 'HVAC revenue is 42% of total revenue. Consider expanding this service line.',
            type: 'warning',
            action: 'Create Promotion',
            actionUrl: '/marketing',
            icon: AlertTriangle
          },
          {
            id: 2,
            title: 'Scheduling Optimization',
            description: '3 technicians are underutilized. Optimize your schedule to balance workloads.',
            type: 'info',
            action: 'Optimize Schedule',
            actionUrl: '/schedule',
            icon: Clock
          },
          {
            id: 3,
            title: 'Customer Satisfaction',
            description: 'Average client satisfaction is 4.2/5 based on recent surveys. Great job!',
            type: 'success',
            action: 'View Details',
            actionUrl: '/reports',
            icon: Star
          },
          {
            id: 4,
            title: 'Performance Trend',
            description: 'Your business has 12 completed jobs this period with average value of $450.',
            type: 'info',
            action: 'View Analytics',
            actionUrl: '/reports',
            icon: TrendingUp
          }
        ];
        
        setInsights(mockInsights);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchInsights();
  }, [user]);
  
  const getBackgroundColor = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-fixlyfy-success/10';
      case 'warning':
        return 'bg-fixlyfy-warning/10';
      case 'info':
        return 'bg-fixlyfy-info/10';
      default:
        return 'bg-fixlyfy/10';
    }
  };
  
  const getIconColor = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return 'text-fixlyfy-success';
      case 'warning':
        return 'text-fixlyfy-warning';
      case 'info':
        return 'text-fixlyfy-info';
      default:
        return 'text-fixlyfy';
    }
  };
  
  const handleAction = (url?: string) => {
    if (url) {
      navigate(url);
    } else {
      toast.info('This feature is coming soon!');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">AI Business Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4 h-48">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-gray-200 rounded mr-2"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-28 bg-gray-200 rounded mt-auto"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          insights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`${getBackgroundColor(insight.type)} border border-${getIconColor(insight.type).replace('text', 'border')}/30`}
            >
              <CardContent className="p-4 flex flex-col h-48">
                <div className="flex items-center mb-3">
                  <div className={`p-1.5 rounded mr-2 ${getIconColor(insight.type)}`}>
                    <insight.icon size={18} />
                  </div>
                  <h3 className="font-medium">{insight.title}</h3>
                </div>
                <p className="text-sm text-fixlyfy-text-secondary mb-4 flex-grow">
                  {insight.description}
                </p>
                {insight.action && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto"
                    onClick={() => handleAction(insight.actionUrl)}
                  >
                    {insight.action}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
