
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  X, 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useIntelligentAI } from '@/hooks/useIntelligentAI';
import { useUserTracking } from '@/hooks/useUserTracking';
import { useLocation } from 'react-router-dom';

interface SmartNotification {
  id: string;
  type: 'insight' | 'warning' | 'suggestion' | 'success';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  timestamp: string;
}

export const SmartNotificationsPanel = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const { getAIRecommendation, provideFeedback, isLoading } = useIntelligentAI();
  const { trackAction } = useUserTracking();
  const location = useLocation();

  useEffect(() => {
    generateContextualNotifications();
  }, [location.pathname]);

  const generateContextualNotifications = async () => {
    try {
      const result = await getAIRecommendation({
        prompt: `Analyze the current page (${location.pathname}) and provide 3-4 smart notifications for the user. Include actionable insights, warnings about potential issues, and optimization suggestions. Format as JSON array with: type, title, content, priority, actionable fields.`,
        context: {
          currentTask: 'contextual_notifications',
          page: location.pathname
        }
      });

      if (result?.suggestions) {
        const smartNotifications: SmartNotification[] = result.suggestions.map((suggestion, index) => ({
          id: `notif-${Date.now()}-${index}`,
          type: getNotificationType(suggestion),
          title: getNotificationTitle(suggestion),
          content: suggestion,
          priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
          actionable: suggestion.includes('Review') || suggestion.includes('Check') || suggestion.includes('Update'),
          timestamp: new Date().toISOString()
        }));

        setNotifications(smartNotifications);
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  const getNotificationType = (content: string): SmartNotification['type'] => {
    if (content.toLowerCase().includes('warning') || content.toLowerCase().includes('overdue')) {
      return 'warning';
    }
    if (content.toLowerCase().includes('opportunity') || content.toLowerCase().includes('optimize')) {
      return 'insight';
    }
    if (content.toLowerCase().includes('success') || content.toLowerCase().includes('completed')) {
      return 'success';
    }
    return 'suggestion';
  };

  const getNotificationTitle = (content: string): string => {
    if (content.includes('Review')) return 'Action Required';
    if (content.includes('Check')) return 'Quick Check';
    if (content.includes('Optimize')) return 'Optimization Tip';
    if (content.includes('Analyze')) return 'Business Insight';
    return 'Smart Suggestion';
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'insight':
        return <TrendingUp className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: SmartNotification['type']) => {
    switch (type) {
      case 'insight':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-purple-50 border-purple-200 text-purple-800';
    }
  };

  const handleFeedback = async (notificationId: string, isHelpful: boolean) => {
    await provideFeedback(notificationId, isHelpful);
    trackAction({
      actionType: 'ai_feedback',
      element: 'smart_notification',
      context: { notificationId, isHelpful }
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    trackAction({
      actionType: 'dismiss_notification',
      element: 'smart_notification',
      context: { notificationId }
    });
  };

  if (!isVisible || notifications.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Brain className="h-4 w-4 mr-2" />
        AI Insights
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            AI Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium text-sm">{notification.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {notification.priority}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{notification.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFeedback(notification.id, true)}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFeedback(notification.id, false)}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {isLoading && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Generating insights...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
