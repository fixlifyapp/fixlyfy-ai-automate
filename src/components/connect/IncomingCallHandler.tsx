
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Volume2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface IncomingCall {
  id: string;
  call_sid: string | null;
  phone_number: string;
  direction: "incoming";
  status: string | null;
}

export const IncomingCallHandler = () => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    // Listen for incoming calls via real-time updates
    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: 'direction=eq.incoming'
        },
        (payload) => {
          console.log('Incoming call detected:', payload);
          const newCall = payload.new as any;
          if (newCall.status === 'ringing') {
            setIncomingCall({
              id: newCall.id,
              call_sid: newCall.call_sid,
              phone_number: newCall.phone_number,
              direction: 'incoming',
              status: newCall.status
            });
            setIsRinging(true);
            
            // Play notification sound
            toast.info(`Incoming call from ${newCall.phone_number}`, {
              duration: 15000,
              action: {
                label: "Answer",
                onClick: () => answerCall(newCall.call_sid)
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls'
        },
        (payload) => {
          const updatedCall = payload.new as any;
          if (incomingCall && updatedCall.call_sid === incomingCall.call_sid) {
            if (updatedCall.status === 'completed' || updatedCall.status === 'failed') {
              setIncomingCall(null);
              setIsRinging(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incomingCall]);

  const answerCall = async (callSid?: string | null) => {
    const targetCallSid = callSid || incomingCall?.call_sid;
    if (!targetCallSid) return;

    try {
      // In a real implementation, you would use Twilio's client SDK to actually answer
      // For now, we'll just update the call status to indicate it was answered
      const { error } = await supabase
        .from('calls')
        .update({ 
          status: 'in-progress',
          notes: 'Call answered from web interface'
        })
        .eq('call_sid', targetCallSid);

      if (error) throw error;

      setIsRinging(false);
      setIncomingCall(null);
      toast.success("Call answered - this would connect to Twilio's voice client");
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  const declineCall = async () => {
    if (!incomingCall) return;

    try {
      // Hangup the call via Twilio
      const { error: twilioError } = await supabase.functions.invoke('twilio-calls', {
        body: {
          action: 'hangup',
          callSid: incomingCall.call_sid
        }
      });

      if (twilioError) throw twilioError;

      // Update local state
      setIncomingCall(null);
      setIsRinging(false);
      toast.info("Call declined");
    } catch (error) {
      console.error('Error declining call:', error);
      toast.error('Failed to decline call');
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  if (!isRinging || !incomingCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 animate-pulse">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Volume2 size={48} className="mx-auto text-blue-500 animate-bounce" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Incoming Call</h3>
          <p className="text-lg mb-6">{formatPhoneNumber(incomingCall.phone_number)}</p>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={declineCall}
              className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16"
            >
              <PhoneOff size={24} />
            </Button>
            
            <Button
              onClick={() => answerCall()}
              className="bg-green-600 hover:bg-green-700 rounded-full w-16 h-16"
            >
              <Phone size={24} />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Note: This is a demo interface. In production, this would connect to Twilio's voice client.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
