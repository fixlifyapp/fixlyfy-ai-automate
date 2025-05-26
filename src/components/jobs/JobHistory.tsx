
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText } from "lucide-react";
import { useJobHistory } from "@/hooks/useJobHistory";
import { formatDistanceToNow } from "date-fns";

interface JobHistoryProps {
  jobId: string;
}

export const JobHistory = ({ jobId }: JobHistoryProps) => {
  const { historyItems, isLoading } = useJobHistory(jobId);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'status-change':
        return <Clock className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 text-blue-800';
      case 'status-change':
        return 'bg-green-100 text-green-800';
      case 'estimate':
        return 'bg-purple-100 text-purple-800';
      case 'invoice':
        return 'bg-orange-100 text-orange-800';
      case 'payment':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Job History ({historyItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : historyItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No history yet</p>
            <p className="text-sm">Activity will appear here as the job progresses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <Badge className={getTypeBadgeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.user_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.user_name}
                      </span>
                    )}
                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
