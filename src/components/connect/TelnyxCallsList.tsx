
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Clock, User, MessageSquare, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMessageContext } from "@/contexts/MessageContext";
import { toast } from "sonner";

interface TelnyxCall {
  id: string;
  call_control_id: string;
  from_number: string;
  to_number: string;
  direction: 'inbound' | 'outbound';
  status: string;
  client_id?: string;
  job_id?: string;
  started_at: string;
  answered_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  ai_transcript?: string;
  call_summary?: string;
  clients?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const TelnyxCallsList = () => {
  const [calls, setCalls] = useState<TelnyxCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);
  const { openMessageDialog } = useMessageContext();

  useEffect(() => {
    loadCalls();
    
    // Set up real-time subscription for Telnyx calls
    const channel = supabase
      .channel('telnyx-calls-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telnyx_calls'
        },
        () => {
          loadCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('telnyx_calls')
        .select(`
          *,
          clients:client_id(id, name, phone)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error loading Telnyx calls:', error);
      toast.error('Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const makeCall = async (phoneNumber: string, clientId?: string, jobId?: string) => {
    setCallingNumber(phoneNumber);
    
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: phoneNumber,
          clientId,
          jobId
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to initiate call');
      }

      toast.success('Call initiated successfully');
      // Refresh calls list to show the new outbound call
      setTimeout(loadCalls, 1000);
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call: ' + error.message);
    } finally {
      setCallingNumber(null);
    }
  };

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return "Unknown";
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "success";
      case 'answered': return "default";
      case 'streaming': return "default";
      case 'initiated': return "secondary";
      case 'connected': return "default";
      default: return "secondary";
    }
  };

  const getStatusIcon = (direction: string, status: string) => {
    if (direction === 'outbound') {
      return <PhoneCall className="h-4 w-4 text-green-600" />;
    }
    return <Phone className="h-4 w-4 text-blue-600" />;
  };

  const handleMessageClient = (call: TelnyxCall) => {
    if (call.clients) {
      openMessageDialog({
        id: call.client_id || "",
        name: call.clients.name,
        phone: call.from_number
      });
    } else {
      // Open message dialog with phone number
      openMessageDialog({
        id: "",
        name: `Client ${formatPhoneNumber(call.from_number)}`,
        phone: call.from_number
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading calls...</p>
        </CardContent>
      </Card>
    );
  }

  if (calls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
            <p className="text-gray-500">
              Calls will appear here when made or received through Telnyx.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Recent Calls ({calls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    {getStatusIcon(call.direction, call.status)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {call.clients?.name || formatPhoneNumber(
                          call.direction === 'inbound' ? call.from_number : call.to_number
                        )}
                      </span>
                      <Badge variant={getStatusColor(call.status)}>
                        {call.status.toUpperCase()}
                      </Badge>
                      <Badge variant={call.direction === 'inbound' ? "default" : "secondary"}>
                        {call.direction.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span>
                        {call.direction === 'inbound' ? 'From' : 'To'}: {formatPhoneNumber(
                          call.direction === 'inbound' ? call.from_number : call.to_number
                        )}
                      </span>
                      {call.duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration_seconds)}
                        </span>
                      )}
                      <span>{new Date(call.started_at).toLocaleString()}</span>
                    </div>
                    {call.ai_transcript && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{call.ai_transcript}</p>
                    )}
                    {call.call_summary && (
                      <p className="text-sm text-blue-600 mt-1 line-clamp-1">Summary: {call.call_summary}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessageClient(call)}
                    className="gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => makeCall(
                      call.direction === 'inbound' ? call.from_number : call.to_number,
                      call.client_id,
                      call.job_id
                    )}
                    disabled={callingNumber === (call.direction === 'inbound' ? call.from_number : call.to_number)}
                    className="gap-1"
                  >
                    {callingNumber === (call.direction === 'inbound' ? call.from_number : call.to_number) ? (
                      <>
                        <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <Phone className="h-3 w-3" />
                        Call Back
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
