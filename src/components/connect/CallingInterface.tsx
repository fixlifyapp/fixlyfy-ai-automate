
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff, Bot } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  status: string;
}

export const CallingInterface = () => {
  const [ownedNumbers, setOwnedNumbers] = useState<PhoneNumber[]>([]);
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>("");
  const [toNumber, setToNumber] = useState<string>("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  const [callType, setCallType] = useState<"regular" | "ai">("regular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnedNumbers();
  }, []);

  const loadOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
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
      toast.error('Failed to load your phone numbers');
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
      
      // First, record the call in our database
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .insert({
          phone_number: toNumber,
          direction: 'outgoing',
          status: 'initiated',
          notes: `${callType === 'ai' ? 'AI-powered call' : 'Regular call'} initiated from ${selectedFromNumber}`
        })
        .select()
        .single();

      if (callError) throw callError;

      // Then initiate the actual call
      const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
        body: {
          action: 'initiate',
          fromNumber: selectedFromNumber,
          toNumber: toNumber,
          callType: callType,
          callId: callData.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setCurrentContactId(data.contactId);
        toast.success(`${callType === 'ai' ? 'AI call' : 'Call'} initiated successfully`);
        
        // Update the call record with the contact ID
        await supabase
          .from('calls')
          .update({ 
            status: 'in-progress',
            call_sid: data.contactId 
          })
          .eq('id', callData.id);
      } else {
        throw new Error(data.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
      setIsCallActive(false);
    }
  };

  const hangupCall = async () => {
    if (!currentContactId) return;

    try {
      const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
        body: {
          action: 'hangup',
          contactId: currentContactId
        }
      });

      if (error) throw error;

      // Update call record
      await supabase
        .from('calls')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_sid', currentContactId);

      setIsCallActive(false);
      setCurrentContactId(null);
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
          <p className="text-sm text-gray-500 mt-2">Loading phone numbers...</p>
        </CardContent>
      </Card>
    );
  }

  if (ownedNumbers.length === 0) {
    return (
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Make a Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Phone Numbers</h3>
            <p className="text-gray-500 mb-4">
              You need to purchase a phone number before you can make calls.
            </p>
            <Button onClick={() => window.location.href = '/connect?tab=phone-numbers'}>
              Get Phone Number
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
          <Phone className="h-5 w-5" />
          Make a Call
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
              <label className="text-sm font-medium mb-2 block">From Number</label>
              <Select value={selectedFromNumber} onValueChange={setSelectedFromNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your phone number" />
                </SelectTrigger>
                <SelectContent>
                  {ownedNumbers.map((number) => (
                    <SelectItem key={number.id} value={number.phone_number}>
                      {formatPhoneNumber(number.phone_number)}
                      {number.friendly_name && ` (${number.friendly_name})`}
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
              {callType === "ai" ? (
                <>
                  <Bot size={16} className="mr-2" />
                  Start AI Call
                </>
              ) : (
                <>
                  <Phone size={16} className="mr-2" />
                  Call
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-6 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {callType === "ai" && <Bot size={20} className="text-blue-600" />}
                <div className="text-lg font-semibold">
                  {callType === "ai" ? "AI Call Active" : "Call Active"}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                From: {formatPhoneNumber(selectedFromNumber)}
              </div>
              <div className="text-sm text-gray-600">
                To: {formatPhoneNumber(toNumber)}
              </div>
              {callType === "ai" && (
                <div className="text-xs text-blue-600 mt-2">
                  AI Assistant is handling this call
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={toggleMute}
                className={isMuted ? "bg-red-50" : ""}
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
