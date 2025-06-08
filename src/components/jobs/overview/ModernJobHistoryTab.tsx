
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, CreditCard, Calendar, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModernJobHistoryTabProps {
  jobId: string;
}

interface HistoryItem {
  id: string;
  type: 'status_change' | 'estimate_created' | 'invoice_created' | 'payment_received' | 'appointment_scheduled' | 'note_added';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  amount?: number;
}

export const ModernJobHistoryTab = ({ jobId }: ModernJobHistoryTabProps) => {
  const isMobile = useIsMobile();

  // Mock history data - in real app this would come from an API
  const historyItems: HistoryItem[] = [
    {
      id: '1',
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Payment of $536.52 received via credit card',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'System',
      amount: 536.52
    },
    {
      id: '2',
      type: 'invoice_created',
      title: 'Invoice Created',
      description: 'Invoice #INV-2024-001 created for $536.52',
      timestamp: '2024-01-14T14:20:00Z',
      user: 'John Doe'
    },
    {
      id: '3',
      type: 'status_change',
      title: 'Status Updated',
      description: 'Job status changed from "In Progress" to "Completed"',
      timestamp: '2024-01-14T11:15:00Z',
      user: 'Mike Smith'
    },
    {
      id: '4',
      type: 'note_added',
      title: 'Note Added',
      description: 'Customer requested additional warranty coverage',
      timestamp: '2024-01-13T16:45:00Z',
      user: 'Sarah Johnson'
    },
    {
      id: '5',
      type: 'appointment_scheduled',
      title: 'Appointment Scheduled',
      description: 'Service appointment scheduled for Jan 12, 2024 at 9:00 AM',
      timestamp: '2024-01-10T08:30:00Z',
      user: 'Lisa Wilson'
    },
    {
      id: '6',
      type: 'estimate_created',
      title: 'Estimate Created',
      description: 'Initial estimate #EST-2024-001 created for $536.52',
      timestamp: '2024-01-09T13:20:00Z',
      user: 'John Doe'
    }
  ];

  const getIcon = (type: HistoryItem['type']) => {
    const iconProps = {
      className: `h-4 w-4 ${isMobile ? 'flex-shrink-0' : ''}`,
      'aria-hidden': true
    };

    switch (type) {
      case 'status_change':
        return <Clock {...iconProps} />;
      case 'estimate_created':
        return <FileText {...iconProps} />;
      case 'invoice_created':
        return <FileText {...iconProps} />;
      case 'payment_received':
        return <CreditCard {...iconProps} />;
      case 'appointment_scheduled':
        return <Calendar {...iconProps} />;
      case 'note_added':
        return <MessageSquare {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getBadgeColor = (type: HistoryItem['type']) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-100 text-blue-800';
      case 'estimate_created':
        return 'bg-purple-100 text-purple-800';
      case 'invoice_created':
        return 'bg-orange-100 text-orange-800';
      case 'payment_received':
        return 'bg-green-100 text-green-800';
      case 'appointment_scheduled':
        return 'bg-cyan-100 text-cyan-800';
      case 'note_added':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold">Job History</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Complete timeline of all activities for this job
        </p>
      </div>

      {/* History Timeline */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Activity Timeline ({historyItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
          {historyItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-medium">No history yet</p>
              <p className="text-xs sm:text-sm">Job activities will appear here as they occur</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {historyItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`relative ${index !== historyItems.length - 1 ? 'pb-4' : ''}`}
                >
                  {/* Timeline line */}
                  {index !== historyItems.length - 1 && (
                    <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-muted" />
                  )}
                  
                  <div className="flex gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {getIcon(item.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm sm:text-base break-words">{item.title}</h4>
                            <Badge className={getBadgeColor(item.type)}>
                              {item.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">
                            {item.description}
                          </p>
                        </div>
                        
                        {item.amount && (
                          <div className="text-base sm:text-lg font-semibold text-green-600 flex-shrink-0">
                            {formatCurrency(item.amount)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{item.user || 'System'}</span>
                        </div>
                        <span>
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
