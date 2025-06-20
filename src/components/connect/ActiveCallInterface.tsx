
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ActiveCall {
  id: string;
  call_control_id: string;
  from_number: string;
  to_number: string;
  status: string;
  started_at: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const ActiveCallInterface = () => {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAIHandling, setIsAIHandling] = useState(true);

  useEffect(() => {
    // Listen for active calls
    const channel = supabase
      .channel('active-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telnyx_calls'
        },
        async (payload) => {
          const call = payload.new as any;
          
          if (call && (call.status === 'answered' || call.status === 'connected' || call.status === 'streaming')) {
            // Find client by phone number
            const client = await findClientByPhone(call.from_number || call.to_number);
            
            setActiveCall({
              id: call.id,
              call_control_id: call.call_control_id,
              from_number: call.from_number,
              to_number: call.to_number,
              status: call.status,
              started_at: call.started_at || call.answered_at,
              client
            });
          } else if (call && (call.status === 'completed' || call.status === 'failed')) {
            setActiveCall(null);
            setCallDuration(0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeCall && activeCall.started_at) {
      interval = setInterval(() => {
        const startTime = new Date(activeCall.started_at).getTime();
        const now = new Date().getTime();
        const duration = Math.floor((now - startTime) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  const findClientByPhone = async (phoneNumber: string) => {
    if (!phoneNumber) return null;
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .ilike('phone', `%${cleanPhone.slice(-10)}%`);
      
      if (error) {
        console.error('Error searching for client:', error);
        return null;
      }
      
      return clients && clients.length > 0 ? clients[0] : null;
    } catch (error) {
      console.error('Error finding client by phone:', error);
      return null;
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      // Call Telnyx API to hangup the call
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: 'hangup',
          call_control_id: activeCall.call_control_id
        }
      });

      if (error) throw error;

      toast.success("Call ended");
      setActiveCall(null);
      setCallDuration(0);
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  const toggleMute = async () => {
    if (!activeCall) return;

    try {
      // Call Telnyx API to mute/unmute
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: isMuted ? 'unmute' : 'mute',
          call_control_id: activeCall.call_control_id
        }
      });

      if (error) throw error;

      setIsMuted(!isMuted);
      toast.success(isMuted ? "Unmuted" : "Muted");
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to toggle mute');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  if (!activeCall) {
    return null;
  }

  const displayName = activeCall.client?.name || formatPhoneNumber(activeCall.from_number || activeCall.to_number);
  const isKnownClient = !!activeCall.client;

  return (
    <Card className="mb-6 border-2 border-green-500 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Phone className="h-5 w-5" />
          Active Call
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              {isKnownClient ? (
                <User className="h-5 w-5 text-green-600" />
              ) : (
                <Phone className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayName}</span>
                {isKnownClient && (
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Known Client
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatPhoneNumber(activeCall.from_number || activeCall.to_number)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDuration(callDuration)}
            </div>
            <Badge variant="default" className="mt-1">
              {activeCall.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleMute}
            className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-100 border-red-300' : ''}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          
          <Button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16"
          >
            <PhoneOff size={24} />
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isAIHandling ? "AI Agent is handling this call" : "Manual mode - You are handling this call"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
