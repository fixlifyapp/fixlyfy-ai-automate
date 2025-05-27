
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Clock, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMessageContext } from "@/contexts/MessageContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Call {
  id: string;
  phone_number: string;
  direction: "incoming" | "outgoing" | "missed";
  status: string;
  duration?: string;
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
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const { openMessageDialog } = useMessageContext();

  useEffect(() => {
    loadCalls();
    
    // Set up real-time subscription for new calls
    const channel = supabase
      .channel('calls-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
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
        .from('calls')
        .select(`
          *,
          clients:client_id(name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const transformedCalls = (data || []).map(call => ({
        ...call,
        direction: call.direction as "incoming" | "outgoing" | "missed",
        client: call.clients ? {
          name: call.clients.name,
          phone: call.clients.phone
        } : undefined
      }));
      
      setCalls(transformedCalls);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return "Unknown";
    return duration;
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const getStatusColor = (status: string, direction: string) => {
    if (direction === "missed") return "destructive";
    if (status === "completed") return "success";
    if (status === "in-progress") return "default";
    return "secondary";
  };

  const handleMessageClient = (call: Call) => {
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
          <p className="text-gray-500">
            Start making calls to see your call history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Calls ({calls.length})</h3>
      </div>
      
      <div className="space-y-3">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                call.direction === 'incoming' ? 'bg-green-100' : 
                call.direction === 'missed' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {call.direction === 'missed' ? (
                  <PhoneOff className={`h-4 w-4 text-red-600`} />
                ) : (
                  <Phone className={`h-4 w-4 ${
                    call.direction === 'incoming' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {call.client?.name || formatPhoneNumber(call.phone_number)}
                  </span>
                  <Badge variant={getStatusColor(call.status, call.direction)}>
                    {call.direction === 'missed' ? 'Missed' : call.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>{formatPhoneNumber(call.phone_number)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(call.duration)}
                  </span>
                  <span>{new Date(call.started_at).toLocaleString()}</span>
                </div>
                {call.notes && (
                  <p className="text-sm text-gray-600 mt-1">{call.notes}</p>
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
