
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneOff, Bot } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export const CallDialog = ({ isOpen, onClose, phoneNumber }: CallDialogProps) => {
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>("");
  const [ownedNumbers, setOwnedNumbers] = useState<any[]>([]);
  const [isInitiating, setIsInitiating] = useState(false);
  const [callType, setCallType] = useState<"regular" | "ai">("regular");

  // Load owned phone numbers
  useEffect(() => {
    const loadOwnedNumbers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
          body: { action: 'list-owned' }
        });

        if (error) throw error;
        setOwnedNumbers(data.phone_numbers || []);
        
        // Set default to first available number
        if (data.phone_numbers && data.phone_numbers.length > 0) {
          setSelectedFromNumber(data.phone_numbers[0].phone_number);
        }
      } catch (error) {
        console.error('Error loading owned numbers:', error);
      }
    };

    if (isOpen) {
      loadOwnedNumbers();
    }
  }, [isOpen]);

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const num = cleaned.slice(1);
      return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
    }
    return number;
  };

  const handleCall = async () => {
    if (!selectedFromNumber) {
      toast.error("Please select a phone number to call from");
      return;
    }

    setIsInitiating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
        body: {
          action: 'initiate',
          fromNumber: selectedFromNumber,
          toNumber: phoneNumber,
          callType: callType
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`${callType === "ai" ? "AI call" : "Call"} initiated to ${formatPhoneNumber(phoneNumber)}`);
        onClose();
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make a Call</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Calling:</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{formatPhoneNumber(phoneNumber)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Call Type:</label>
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

          {ownedNumbers.length > 0 ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Call from:</label>
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
          ) : (
            <div className="p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                No phone numbers available. Please purchase a phone number first.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              <PhoneOff size={16} className="mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={handleCall}
              disabled={!selectedFromNumber || isInitiating || ownedNumbers.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {callType === "ai" ? <Bot size={16} className="mr-2" /> : <Phone size={16} className="mr-2" />}
              {isInitiating ? "Calling..." : (callType === "ai" ? "AI Call" : "Call")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
