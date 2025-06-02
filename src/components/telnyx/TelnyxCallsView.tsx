
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, User, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TelnyxCall {
  id: string;
  phone_number: string;
  to_number: string;
  call_status: string;
  direction: string;
  ai_transcript?: string;
  appointment_scheduled?: boolean;
  appointment_data?: any;
  started_at: string;
  ended_at?: string;
  call_duration?: number;
}

export function TelnyxCallsView() {
  const { data: calls = [], isLoading, error } = useQuery({
    queryKey: ['telnyx-calls'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('telnyx_calls')
          .select(`
            id,
            phone_number,
            to_number,
            call_status,
            direction,
            ai_transcript,
            appointment_scheduled,
            appointment_data,
            started_at,
            ended_at,
            call_duration
          `)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching Telnyx calls:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Error in Telnyx calls query:', err);
        return [];
      }
    }
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'answered': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading calls...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Recent AI Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Unable to load calls</h3>
              <p className="text-muted-foreground">
                There was an issue loading your call history. Please make sure your Telnyx integration is properly configured.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Recent AI Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No calls yet</h3>
              <p className="text-muted-foreground">
                Calls will appear here once your AI dispatcher receives calls
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call: TelnyxCall) => (
                <div
                  key={call.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{call.phone_number}</span>
                      <Badge variant={getStatusColor(call.call_status)}>
                        {call.call_status}
                      </Badge>
                      {call.appointment_scheduled && (
                        <Badge variant="outline" className="text-green-600">
                          Appointment Scheduled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(call.call_duration)}
                      </div>
                      <span>{new Date(call.started_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {call.ai_transcript && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        AI Transcript
                      </h4>
                      <p className="text-sm whitespace-pre-wrap">{call.ai_transcript}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
