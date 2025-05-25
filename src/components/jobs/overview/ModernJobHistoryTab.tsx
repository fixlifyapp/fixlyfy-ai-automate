
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Calendar, User, MessageSquare, Clock, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ModernJobHistoryTabProps {
  jobId: string;
}

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  description: string;
  user_name?: string;
  created_at: string;
  meta?: any;
  visibility: string;
}

export const ModernJobHistoryTab = ({ jobId }: ModernJobHistoryTabProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_history")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching job history:", error);
      toast.error("Failed to load job history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [jobId]);

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'note':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHistoryTypeColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'payment':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'note':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'appointment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle icon={History}>
            Job History ({history.length})
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No history available</p>
              <p className="text-sm">Job activity will appear here as it happens</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      {getHistoryIcon(item.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={getHistoryTypeColor(item.type)}
                              >
                                {item.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </div>
                              {item.user_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {item.user_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};
