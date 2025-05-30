
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Clock, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMessageContext } from "@/contexts/MessageContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ConnectCall {
  id: string;
  phone_number: string;
  call_status: string;
  call_duration?: number;
  started_at: string;
  ended_at?: string;
  client_id?: string;
  notes?: string;
  client?: {
    name: string;
    phone: string;
  };
}

export const RealCallsList = () => {
  const [calls, setCalls] = useState<ConnectCall[]>([]);
  const [loading, setLoading] = useState(true);
  const { openMessageDialog } = useMessageContext();

  useEffect(() => {
    loadCalls();
    
    // Set up real-time subscription for Amazon Connect calls
    const channel = supabase
      .channel('amazon-connect-calls-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'amazon_connect_calls'
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
        .from('amazon_connect_calls')
        .select(`
          *,
          clients:client_id(name, phone)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const transformedCalls = (data || []).map(call => ({
        ...call,
        client: call.clients ? {
          name: call.clients.name,
          phone: call.clients.phone
        } : undefined
      }));
      
      setCalls(transformedCalls);
    } catch (error) {
      console.error('Error loading Amazon Connect calls:', error);
    } finally {
      setLoading(false);
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
      case 'emergency_transfer': return "destructive";
      case 'ai_handled': return "default";
      case 'in-progress': return "default";
      default: return "secondary";
    }
  };

  const handleMessageClient = (call: ConnectCall) => {
    if (call.client) {
      openMessageDialog({
        id: call.client_id || "",
        name: call.client.name,
        phone: call.phone_number
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Amazon Connect calls yet</h3>
          <p className="text-gray-500">
            Amazon Connect AI calls will appear here once configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Amazon Connect Calls ({calls.length})</h3>
      </div>
      
      <div className="space-y-3">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {call.client?.name || formatPhoneNumber(call.phone_number)}
                  </span>
                  <Badge variant={getStatusColor(call.call_status)}>
                    {call.call_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>{formatPhoneNumber(call.phone_number)}</span>
                  {call.call_duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(call.call_duration)}
                    </span>
                  )}
                  <span>{new Date(call.started_at).toLocaleString()}</span>
                </div>
                {call.ai_transcript && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{call.ai_transcript}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {call.client && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMessageClient(call)}
                  className="gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  Message
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
