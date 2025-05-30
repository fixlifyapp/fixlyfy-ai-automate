
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Volume2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface IncomingCall {
  id: string;
  contact_id: string | null;
  phone_number: string;
  call_status: string | null;
}

export const IncomingCallHandler = () => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    // Listen for incoming Amazon Connect calls via real-time updates
    const channel = supabase
      .channel('incoming-amazon-connect-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'amazon_connect_calls'
        },
        (payload) => {
          console.log('Incoming Amazon Connect call detected:', payload);
          const newCall = payload.new as any;
          if (newCall.call_status === 'initiated') {
            setIncomingCall({
              id: newCall.id,
              contact_id: newCall.contact_id,
              phone_number: newCall.phone_number,
              call_status: newCall.call_status
            });
            setIsRinging(true);
            
            // Play notification sound
            toast.info(`Incoming Amazon Connect call from ${newCall.phone_number}`, {
              duration: 15000,
              action: {
                label: "Answer",
                onClick: () => answerCall(newCall.contact_id)
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
          table: 'amazon_connect_calls'
        },
        (payload) => {
          const updatedCall = payload.new as any;
          if (incomingCall && updatedCall.contact_id === incomingCall.contact_id) {
            if (updatedCall.call_status === 'completed' || updatedCall.call_status === 'failed') {
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

  const answerCall = async (contactId?: string | null) => {
    const targetContactId = contactId || incomingCall?.contact_id;
    if (!targetContactId) return;

    try {
      // Update the Amazon Connect call status to indicate it was answered
      const { error } = await supabase
        .from('amazon_connect_calls')
        .update({ 
          call_status: 'in-progress'
        })
        .eq('contact_id', targetContactId);

      if (error) throw error;

      setIsRinging(false);
      setIncomingCall(null);
      toast.success("Call answered - Amazon Connect interface would handle the actual call");
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  const declineCall = async () => {
    if (!incomingCall) return;

    try {
      // Update the call status to declined
      const { error } = await supabase
        .from('amazon_connect_calls')
        .update({ 
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('contact_id', incomingCall.contact_id);

      if (error) throw error;

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
          
          <h3 className="text-xl font-semibold mb-2">Incoming Amazon Connect Call</h3>
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
            Note: This is a demo interface. In production, Amazon Connect would handle the actual call routing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
