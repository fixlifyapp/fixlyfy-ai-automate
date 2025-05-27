
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Phone, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface ConnectCall {
  id: string;
  contact_id: string;
  instance_id: string;
  phone_number: string;
  client_id: string | null;
  call_duration: number | null;
  appointment_scheduled: boolean;
  appointment_data: any;
  ai_transcript: string | null;
  call_status: string;
  started_at: string;
  ended_at: string | null;
  clients?: {
    id: string;
    name: string;
  } | null;
}

export const ConnectCallsList = () => {
  const [calls, setCalls] = useState<ConnectCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('amazon_connect_calls')
        .select(`
          *,
          clients:client_id(id, name)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error("Error fetching Amazon Connect calls:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  // Set up real-time sync for calls
  useRealtimeSync({
    tables: ['amazon_connect_calls'],
    onUpdate: fetchCalls,
    enabled: true
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string, appointmentScheduled: boolean) => {
    if (appointmentScheduled) {
      return <Badge className="bg-green-100 text-green-800">Appointment Scheduled</Badge>;
    }
    
    const statusColors: Record<string, string> = {
      'initiated': 'bg-blue-100 text-blue-800',
      'ringing': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
      'no-answer': 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="border-fixlyfy-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Amazon Connect AI Calls
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No AI Calls Yet</h3>
            <p className="text-sm">
              Amazon Connect AI calls will appear here once configured
            </p>
          </div>
        ) : (
          <div className="divide-y divide-fixlyfy-border">
            {calls.map((call) => (
              <div key={call.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {call.clients?.name || "AI Call"}
                      </h3>
                      <p className="text-sm text-gray-600">{call.phone_number}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(call.call_status, call.appointment_scheduled)}
                        {call.call_duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {formatDuration(call.call_duration)}
                          </div>
                        )}
                      </div>
                      
                      {call.appointment_scheduled && call.appointment_data && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-1 text-sm text-green-700 font-medium">
                            <Calendar size={12} />
                            Appointment: {call.appointment_data.service}
                          </div>
                          <div className="text-xs text-green-600">
                            {call.appointment_data.date} at {call.appointment_data.time}
                          </div>
                          {call.appointment_data.clientName && (
                            <div className="text-xs text-green-600">
                              Client: {call.appointment_data.clientName}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {call.ai_transcript && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium mb-1">AI Transcript:</div>
                          <div className="text-xs text-blue-700 line-clamp-2">
                            {call.ai_transcript}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {formatTimestamp(call.started_at)}
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
