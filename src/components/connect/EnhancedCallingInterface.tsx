
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumber } from "@/types/database";

interface EnhancedCallingInterfaceProps {
  ownedNumbers: PhoneNumber[];
}

interface ActiveCall {
  callSid: string;
  toNumber: string;
  fromNumber: string;
  status: string;
  startTime: Date;
}

export const EnhancedCallingInterface = ({ ownedNumbers }: EnhancedCallingInterfaceProps) => {
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>("");
  const [toNumber, setToNumber] = useState<string>("");
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Set default phone number
  useEffect(() => {
    if (ownedNumbers.length > 0 && !selectedFromNumber) {
      setSelectedFromNumber(ownedNumbers[0].phone_number);
    }
  }, [ownedNumbers, selectedFromNumber]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeCall && activeCall.status === 'in-progress') {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateCall = async () => {
    if (!selectedFromNumber || !toNumber) {
      toast.error("Please select a from number and enter a to number");
      return;
    }

    try {
      toast.info("Initiating call...");
      
      const { data, error } = await supabase.functions.invoke('twilio-calls', {
        body: {
          action: 'initiate',
          fromNumber: selectedFromNumber,
          toNumber: toNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        setActiveCall({
          callSid: data.callSid,
          toNumber: toNumber,
          fromNumber: selectedFromNumber,
          status: data.status,
          startTime: new Date()
        });
        
        toast.success("Call initiated successfully");
        
        // Poll for call status updates
        pollCallStatus(data.callSid);
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    }
  };

  const pollCallStatus = async (callSid: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('twilio-calls', {
          body: {
            action: 'status',
            callSid: callSid
          }
        });

        if (error) throw error;

        if (data.success) {
          setActiveCall(prev => prev ? { ...prev, status: data.status } : null);
          
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'no-answer') {
            clearInterval(pollInterval);
            setActiveCall(null);
            setCallDuration(0);
            setIsMuted(false);
            toast.info(`Call ${data.status}`);
          }
        }
      } catch (error) {
        console.error('Error polling call status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Clear polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const hangupCall = async () => {
    if (!activeCall) return;

    try {
      const { data, error } = await supabase.functions.invoke('twilio-calls', {
        body: {
          action: 'hangup',
          callSid: activeCall.callSid
        }
      });

      if (error) throw error;

      setActiveCall(null);
      setCallDuration(0);
      setIsMuted(false);
      toast.success("Call ended");
    } catch (error) {
      console.error('Error hanging up call:', error);
      toast.error('Failed to end call');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Unmuted" : "Muted");
  };

  return (
    <Card className="border-fixlyfy-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Two-Way Calling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activeCall ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">From Number</label>
              <Select value={selectedFromNumber} onValueChange={setSelectedFromNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your phone number" />
                </SelectTrigger>
                <SelectContent>
                  {ownedNumbers.map((number) => (
                    <SelectItem key={number.id} value={number.phone_number}>
                      {formatPhoneNumber(number.phone_number)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Number</label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
              />
            </div>

            <Button 
              onClick={initiateCall}
              disabled={!selectedFromNumber || !toNumber}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Phone size={16} className="mr-2" />
              Call
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-6 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold mb-2">
                {activeCall.status === 'ringing' && 'Calling...'}
                {activeCall.status === 'in-progress' && 'Call Active'}
                {activeCall.status === 'completed' && 'Call Ended'}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>From: {formatPhoneNumber(activeCall.fromNumber)}</div>
                <div>To: {formatPhoneNumber(activeCall.toNumber)}</div>
                {activeCall.status === 'in-progress' && (
                  <div className="flex items-center justify-center gap-1 text-green-600 font-mono">
                    <Clock size={14} />
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={toggleMute}
                disabled={activeCall.status !== 'in-progress'}
                className={isMuted ? "bg-red-50 border-red-200" : ""}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>

              <Button
                onClick={hangupCall}
                className="bg-red-600 hover:bg-red-700"
              >
                <PhoneOff size={16} className="mr-2" />
                End Call
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
