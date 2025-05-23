
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Volume2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface IncomingCall {
  id: string;
  phone_number: string;
  callSid: string;
  direction: "incoming";
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
              phone_number: newCall.phone_number,
              callSid: newCall.call_sid || '',
              direction: 'incoming'
            });
            setIsRinging(true);
            
            // Play ring sound (you could add actual audio here)
            toast.info(`Incoming call from ${newCall.phone_number}`, {
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      // In a real implementation, you would connect to Twilio's client SDK here
      // For now, we'll just update the call status
      const { error } = await supabase
        .from('calls')
        .update({ status: 'in-progress' })
        .eq('id', incomingCall.id);

      if (error) throw error;

      setIsRinging(false);
      toast.success("Call answered");
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  const declineCall = async () => {
    if (!incomingCall) return;

    try {
      const { error } = await supabase
        .from('calls')
        .update({ 
          status: 'completed',
          direction: 'missed'
        })
        .eq('id', incomingCall.id);

      if (error) throw error;

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
              onClick={answerCall}
              className="bg-green-600 hover:bg-green-700 rounded-full w-16 h-16"
            >
              <Phone size={24} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
