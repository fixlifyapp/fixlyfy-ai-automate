
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Mic, MicOff, Bot, Zap } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
}

export const CallingInterface = () => {
  const [ownedNumbers, setOwnedNumbers] = useState<PhoneNumber[]>([]);
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>("");
  const [toNumber, setToNumber] = useState<string>("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callType, setCallType] = useState<"regular" | "ai">("regular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnedNumbers();
  }, []);

  const loadOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'owned')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOwnedNumbers(data || []);
      if (data && data.length > 0) {
        setSelectedFromNumber(data[0].phone_number);
      }
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast.error('Failed to load Telnyx phone numbers');
    } finally {
      setLoading(false);
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

  const initiateCall = async () => {
    if (!selectedFromNumber || !toNumber) {
      toast.error("Please select a from number and enter a to number");
      return;
    }

    try {
      setIsCallActive(true);
      
      // Record the call in Telnyx calls table
      const { data: callData, error: callError } = await supabase
        .from('telnyx_calls')
        .insert({
          to_number: toNumber,
          from_number: selectedFromNumber,
          direction: 'outbound',
          status: 'initiated',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (callError) throw callError;

      // Initiate call via Telnyx
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: 'call',
          to: toNumber,
          from: selectedFromNumber,
          callType: callType
        }
      });

      if (error) throw error;

      if (data?.success) {
        setCurrentCallId(data.data?.call_control_id);
        toast.success(`${callType === 'ai' ? 'AI call' : 'Call'} initiated via Telnyx`);
        
        // Update the call record with the call control ID
        if (data.data?.call_control_id) {
          await supabase
            .from('telnyx_calls')
            .update({ 
              status: 'streaming',
              call_control_id: data.data.call_control_id 
            })
            .eq('id', callData.id);
        }
      } else {
        throw new Error(data?.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating Telnyx call:', error);
      toast.error('Failed to initiate call via Telnyx');
      setIsCallActive(false);
    }
  };

  const hangupCall = async () => {
    if (!currentCallId) return;

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          action: 'hangup',
          call_control_id: currentCallId
        }
      });

      if (error) throw error;

      // Update call record
      await supabase
        .from('telnyx_calls')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_control_id', currentCallId);

      setIsCallActive(false);
      setCurrentCallId(null);
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

  if (loading) {
    return (
      <Card className="border-fixlyfy-border">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading Telnyx phone numbers...</p>
        </CardContent>
      </Card>
    );
  }

  if (ownedNumbers.length === 0) {
    return (
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Telnyx Calling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Telnyx Numbers</h3>
            <p className="text-gray-500 mb-4">
              You need to configure Telnyx phone numbers before you can make calls.
            </p>
            <Button onClick={() => window.location.href = '/connect?tab=phone-numbers'}>
              Configure Telnyx Numbers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-fixlyfy-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Telnyx Calling
          <Badge variant="outline" className="ml-auto text-blue-600 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            Telnyx Enabled
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCallActive ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Call Type</label>
              <Select value={callType} onValueChange={(value: "regular" | "ai") => setCallType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      Regular Call
                    </div>
                  </SelectItem>
                  <SelectItem value="ai">
                    <div className="flex items-center gap-2">
                      <Bot size={16} />
                      AI Assistant Call
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">From Number (Telnyx)</label>
              <Select value={selectedFromNumber} onValueChange={setSelectedFromNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your Telnyx phone number" />
                </SelectTrigger>
                <SelectContent>
                  {ownedNumbers.map((number) => (
                    <SelectItem key={number.id} value={number.phone_number}>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-blue-600" />
                        {formatPhoneNumber(number.phone_number)}
                      </div>
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
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {callType === "ai" ? (
                <>
                  <Bot size={16} className="mr-2" />
                  Start AI Call via Telnyx
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" />
                  Call via Telnyx
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                {callType === "ai" && <Bot size={20} className="text-blue-600" />}
                <Zap size={16} className="text-blue-600" />
                <div className="text-lg font-semibold text-blue-900">
                  {callType === "ai" ? "AI Call Active" : "Call Active"}
                </div>
              </div>
              <div className="text-sm text-blue-700">
                From: {formatPhoneNumber(selectedFromNumber)}
              </div>
              <div className="text-sm text-blue-700">
                To: {formatPhoneNumber(toNumber)}
              </div>
              {callType === "ai" && (
                <div className="text-xs text-blue-600 mt-2">
                  AI Assistant is handling this call
                </div>
              )}
              <div className="text-xs text-blue-600 mt-1 font-medium">
                Powered by Telnyx
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={toggleMute}
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
