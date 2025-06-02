
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
  call_control_id?: string;
  call_session_id?: string;
  user_id?: string;
}

export function TelnyxCallsView() {
  const { data: calls = [], isLoading, error } = useQuery({
    queryKey: ['telnyx-calls'],
    queryFn: async () => {
      try {
        console.log('Fetching Telnyx calls...');
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
            call_duration,
            call_control_id,
            call_session_id,
            user_id
          `)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching Telnyx calls:', error);
          throw error;
        }
        
        console.log('Fetched calls:', data);
        return data || [];
      } catch (err) {
        console.error('Error in Telnyx calls query:', err);
        throw err;
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
      case 'initiated': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading calls...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('Query error:', error);
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
              <p className="text-muted-foreground mb-4">
                Error: {error.message || 'Unknown error occurred'}
              </p>
              <p className="text-sm text-muted-foreground">
                Please check that your database schema is up to date and try again.
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
            Recent AI Calls ({calls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No calls yet</h3>
              <p className="text-muted-foreground mb-4">
                Test your AI dispatcher by calling +1-437-524-9932
              </p>
              <p className="text-sm text-muted-foreground">
                Make sure your Telnyx webhook is properly configured to see calls here.
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

                  {call.to_number && (
                    <div className="text-sm text-muted-foreground">
                      Called: {call.to_number}
                    </div>
                  )}

                  {call.ai_transcript && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        AI Transcript
                      </h4>
                      <p className="text-sm whitespace-pre-wrap">{call.ai_transcript}</p>
                    </div>
                  )}

                  {call.appointment_data && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Appointment Details</h4>
                      <pre className="text-sm text-green-700">{JSON.stringify(call.appointment_data, null, 2)}</pre>
                    </div>
                  )}

                  {call.call_control_id && (
                    <div className="text-xs text-muted-foreground">
                      Call ID: {call.call_control_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Not seeing calls?</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure your Telnyx webhook URL is set correctly</li>
              <li>• Check that your number is configured for Call Control</li>
              <li>• Verify your TELNYX_API_KEY is set in Supabase secrets</li>
              <li>• Test by calling +1-437-524-9932</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Add your Telnyx number to the "Phone Numbers" tab</li>
              <li>2. Configure the webhook URL in your Telnyx dashboard</li>
              <li>3. Test the AI dispatcher by making a call</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
