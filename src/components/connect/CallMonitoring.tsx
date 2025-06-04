
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Clock, User, MessageSquare, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CallLog {
  id: string;
  contact_id: string;
  phone_number: string;
  call_status: string;
  started_at: string;
  ended_at: string | null;
  call_duration: number | null;
  ai_transcript: string | null;
}

export const CallMonitoring = () => {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallLogs();
    
    // Set up real-time subscription for new calls
    const channel = supabase
      .channel('call-monitoring')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'amazon_connect_calls' }, 
        (payload) => {
          console.log('New call event:', payload);
          loadCallLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCallLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('amazon_connect_calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error loading call logs:', error);
      toast({
        title: "Error",
        description: "Failed to load call logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading call logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          Real-time Call Monitoring
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadCallLogs}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No calls yet</h3>
            <p className="text-sm">Call +1 833-574-3145 to test the AI dispatcher</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{call.phone_number}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(call.started_at).toLocaleString()}
                    </div>
                    {call.contact_id && (
                      <div className="text-xs text-gray-400">
                        Contact ID: {call.contact_id}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge className={getStatusColor(call.call_status)}>
                      {call.call_status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(call.call_duration)}
                    </div>
                  </div>
                  
                  {call.ai_transcript && (
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Transcript
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
