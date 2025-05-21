
import { Card } from "@/components/ui/card";
import { useClientHistory } from "./hooks/useClientHistory";
import { EmptyTabContent } from "./EmptyTabContent";
import { Loader, CalendarDays, CheckCircle, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface HistoryTabProps {
  clientId?: string;
}

export const HistoryTab = ({ clientId }: HistoryTabProps) => {
  const { history, isLoading } = useClientHistory(clientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading client history...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <EmptyTabContent 
        message="No history entries found for this client."
      />
    );
  }

  const getStatusBadge = (type: string, status: string) => {
    if (type === 'job') {
      return (
        <Badge 
          className={
            status === 'completed' 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : status === 'in_progress'
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : status === 'scheduled'
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        >
          {status}
        </Badge>
      );
    } else {
      return (
        <Badge 
          className={
            status === 'paid' 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : status === 'overdue'
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        >
          {status}
        </Badge>
      );
    }
  };

  const getIcon = (type: string) => {
    if (type === 'job') {
      return <CheckCircle size={18} className="text-fixlyfy" />;
    } else {
      return <FileText size={18} className="text-fixlyfy" />;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Client History</h3>
      <div className="space-y-4">
        {history.map(item => (
          <div key={item.id} className="flex border-b pb-4 last:border-0 last:pb-0">
            <div className="h-10 w-10 rounded-full bg-fixlyfy/10 flex items-center justify-center mr-4">
              {getIcon(item.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{item.title}</h4>
                {getStatusBadge(item.type, item.status)}
              </div>
              <p className="text-fixlyfy-text-secondary text-sm">{item.description}</p>
              <div className="flex items-center mt-1 text-xs text-fixlyfy-text-secondary">
                <Clock size={12} className="mr-1" />
                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
