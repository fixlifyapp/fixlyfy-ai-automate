import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobHistory } from "@/hooks/useJobHistory";
import { supabase } from "@/integrations/supabase/client";
import { 
  History, 
  FileText, 
  CreditCard, 
  Send, 
  User, 
  Settings,
  Calendar,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface ModernJobHistoryTabProps {
  jobId: string;
}

export const ModernJobHistoryTab = ({ jobId }: ModernJobHistoryTabProps) => {
  const { historyItems, isLoading, refreshHistory } = useJobHistory(jobId);

  // Real-time updates for job history
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel('job-history-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_history', // Fixed: use correct table name
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Real-time job history update:', payload);
          refreshHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, refreshHistory]);

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'estimate':
      case 'estimate-created':
      case 'estimate-status-change':
      case 'estimate-updated':
        return <FileText className="h-4 w-4" />;
      case 'invoice':
      case 'invoice-created':
      case 'invoice-status-change':
        return <FileText className="h-4 w-4" />;
      case 'payment':
      case 'payment-recorded':
      case 'payment-received':
        return <CreditCard className="h-4 w-4" />;
      case 'communication':
        return <Send className="h-4 w-4" />;
      case 'status-change':
        return <Settings className="h-4 w-4" />;
      case 'technician-assigned':
        return <User className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case 'estimate':
      case 'estimate-created':
      case 'estimate-status-change':
      case 'estimate-updated':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'invoice':
      case 'invoice-created':
      case 'invoice-status-change':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'payment':
      case 'payment-recorded':
      case 'payment-received':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'communication':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'status-change':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'technician-assigned':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'call':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'email':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'message':
        return 'bg-pink-100 text-pink-700 border-pink-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Group history by date
  const groupedHistory = historyItems.reduce((groups, item) => {
    const date = new Date(item.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, typeof historyItems>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <ModernCard className="border border-slate-200 bg-white">
        <ModernCardHeader className="border-b border-slate-200">
          <ModernCardTitle icon={History} className="text-slate-800 text-xl font-semibold">
            <div className="flex items-center gap-2">
              <span>Job History</span>
              <Badge variant="outline" className="font-semibold">
                {historyItems.length} events
              </Badge>
            </div>
          </ModernCardTitle>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-3/4 h-4 bg-slate-200" />
                    <Skeleton className="w-1/2 h-3 bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No history yet</h3>
              <p className="text-slate-500">
                Job activities and changes will appear here as they happen
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="space-y-3 ml-6 border-l-2 border-slate-200 pl-4">
                    {groupedHistory[date].map((item, index) => (
                      <div key={item.id} className="flex items-start gap-3 group">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white ${getHistoryColor(item.type)}`}>
                          {getHistoryIcon(item.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-sm">
                                {item.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                {item.description}
                              </p>
                              {item.user_name && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                  <User className="h-3 w-3" />
                                  <span>by {item.user_name}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
                              <span>
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
