
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumber } from "@/types/database";

interface CallingInterfaceProps {
  ownedNumbers: PhoneNumber[];
}

export const CallingInterface = ({ ownedNumbers }: CallingInterfaceProps) => {
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>("");
  const [toNumber, setToNumber] = useState<string>("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallSid, setCurrentCallSid] = useState<string | null>(null);

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
      const { data, error } = await supabase.functions.invoke('twilio-calls', {
        body: {
          action: 'initiate',
          fromNumber: selectedFromNumber,
          toNumber: toNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        setIsCallActive(true);
        setCurrentCallSid(data.callSid);
        toast.success("Call initiated successfully");
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    }
  };

  const hangupCall = async () => {
    if (!currentCallSid) return;

    try {
      const { data, error } = await supabase.functions.invoke('twilio-calls', {
        body: {
          action: 'hangup',
          callSid: currentCallSid
        }
      });

      if (error) throw error;

      setIsCallActive(false);
      setCurrentCallSid(null);
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
        <CardTitle>Make a Call</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCallActive ? (
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
              <div className="text-lg font-semibold">Call Active</div>
              <div className="text-sm text-gray-600">
                From: {formatPhoneNumber(selectedFromNumber)}
              </div>
              <div className="text-sm text-gray-600">
                To: {formatPhoneNumber(toNumber)}
              </div>
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
