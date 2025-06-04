
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Volume2, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IncomingCall {
  id: string;
  call_control_id: string;
  from_number: string;
  to_number: string;
  call_status: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const IncomingCallHandler = () => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    // Load AI agent preference from localStorage
    const getAIEnabled = () => {
      const savedPreference = localStorage.getItem('ai-agent-enabled');
      return savedPreference !== null ? JSON.parse(savedPreference) : true;
    };

    // Listen for incoming Telnyx calls
    const channel = supabase
      .channel('incoming-telnyx-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telnyx_calls'
        },
        async (payload) => {
          console.log('Incoming Telnyx call detected:', payload);
          const newCall = payload.new as any;
          
          if (newCall.direction === 'inbound' && newCall.call_status === 'initiated') {
            // Find client by phone number
            const client = await findClientByPhone(newCall.from_number);
            
            const callData: IncomingCall = {
              id: newCall.id,
              call_control_id: newCall.call_control_id,
              from_number: newCall.from_number,
              to_number: newCall.to_number,
              call_status: newCall.call_status,
              client
            };

            setIncomingCall(callData);
            setIsRinging(true);
            
            // Show notification
            const clientName = client?.name || formatPhoneNumber(newCall.from_number);
            const isAIEnabled = getAIEnabled();
            
            toast.info(`Incoming call from ${clientName}`, {
              duration: 15000,
              action: {
                label: "Answer",
                onClick: () => answerCall()
              }
            });

            // Auto-answer if AI is enabled
            if (isAIEnabled) {
              setTimeout(() => {
                answerCall();
              }, 2000); // 2 second delay to show the incoming call UI briefly
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'telnyx_calls'
        },
        (payload) => {
          const updatedCall = payload.new as any;
          if (incomingCall && updatedCall.call_control_id === incomingCall.call_control_id) {
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

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      // Update the call status to answered
      const { error } = await supabase
        .from('telnyx_calls')
        .update({ 
          call_status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('call_control_id', incomingCall.call_control_id);

      if (error) throw error;

      setIsRinging(false);
      setIncomingCall(null);
      
      const isAIEnabled = localStorage.getItem('ai-agent-enabled') !== 'false';
      
      if (isAIEnabled) {
        toast.success("Call answered - AI Agent handling the call");
      } else {
        toast.success("Call answered - Manual mode active");
      }
    } catch (error) {
      console.error('Error answering call:', error);
      toast.error('Failed to answer call');
    }
  };

  const declineCall = async () => {
    if (!incomingCall) return;

    try {
      const { error } = await supabase
        .from('telnyx_calls')
        .update({ 
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_control_id', incomingCall.call_control_id);

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

  const displayName = incomingCall.client?.name || formatPhoneNumber(incomingCall.from_number);
  const isKnownClient = !!incomingCall.client;
  const isAIEnabled = localStorage.getItem('ai-agent-enabled') !== 'false';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 animate-pulse border-2 border-blue-500">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Volume2 size={48} className="mx-auto text-blue-500 animate-bounce" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
            {isKnownClient ? (
              <>
                <User className="h-5 w-5 text-green-500" />
                Incoming Call
              </>
            ) : (
              "Incoming Call"
            )}
          </h3>
          
          <p className="text-lg mb-2 font-medium">{displayName}</p>
          <p className="text-sm text-gray-600 mb-4">
            {formatPhoneNumber(incomingCall.from_number)}
          </p>
          
          {isKnownClient && (
            <p className="text-sm text-green-600 mb-4">
              ✓ Known Client
            </p>
          )}
          
          <div className="flex justify-center space-x-4 mb-4">
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
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>AI Agent: {isAIEnabled ? "Enabled" : "Disabled"}</p>
            <p>Powered by Telnyx</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
