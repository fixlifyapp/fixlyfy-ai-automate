
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Bot, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone?: string;
  };
}

export const CallDialog = ({ open, onOpenChange, client }: CallDialogProps) => {
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected" | "ended">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [callType, setCallType] = useState<"regular" | "ai">("regular");

  const handleCall = async () => {
    if (!client.phone) {
      toast.error("No phone number available for this client");
      return;
    }

    setCallStatus("calling");
    
    try {
      // Initiate call via Amazon Connect
      const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
        body: {
          action: 'initiate',
          toNumber: client.phone,
          callType: callType
        }
      });

      if (error) throw error;

      if (data.success) {
        // Simulate connecting after 2 seconds
        setTimeout(() => {
          setCallStatus("connected");
          
          // Start call timer
          const id = window.setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
          
          setIntervalId(id);
        }, 2000);

        toast.success(`${callType === "ai" ? "AI call" : "Call"} initiated via Amazon Connect`);
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to initiate call via Amazon Connect");
      setCallStatus("idle");
    }
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    
    // Clear interval
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Show toast with call duration
    toast.success(`Call ended - Duration: ${formatDuration(callDuration)}`);
    
    // Reset after 2 seconds and close dialog
    setTimeout(() => {
      setCallStatus("idle");
      setCallDuration(0);
      onOpenChange(false);
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Only allow closing if not in an active call
      if (!isOpen && callStatus !== "calling" && callStatus !== "connected") {
        onOpenChange(false);
        // Reset state when closing
        setCallStatus("idle");
        setCallDuration(0);
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      } else if (!isOpen) {
        // Prevent closing during active call
        toast.warning("Please end the call before closing");
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Call {client.name} via Amazon Connect
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mb-2">
              <span className="text-2xl font-semibold text-blue-900">{client.name.charAt(0)}</span>
            </div>
            
            <h3 className="text-xl font-semibold">{client.name}</h3>
            <p className="text-gray-600">{client.phone || "No phone number available"}</p>
            
            {callStatus === "idle" && (
              <div className="w-full">
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
                <p className="text-xs text-blue-600 mt-1">Powered by Amazon Connect</p>
              </div>
            )}
            
            {callStatus === "connected" && (
              <div className="text-center">
                <p className="text-green-500 animate-pulse">
                  {callType === "ai" ? "AI Call in progress" : "Call in progress"} - {formatDuration(callDuration)}
                </p>
                <p className="text-xs text-blue-600 mt-1">via Amazon Connect</p>
              </div>
            )}
            
            {callStatus === "calling" && (
              <div className="text-center">
                <p className="text-amber-500 animate-pulse">
                  {callType === "ai" ? "Initiating AI call..." : "Calling..."}
                </p>
                <p className="text-xs text-blue-600 mt-1">via Amazon Connect</p>
              </div>
            )}
            
            {callStatus === "ended" && (
              <div className="text-center">
                <p className="text-red-500">
                  Call ended - {formatDuration(callDuration)}
                </p>
                <p className="text-xs text-blue-600 mt-1">via Amazon Connect</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          {callStatus === "idle" && (
            <Button onClick={handleCall} className="bg-blue-600 hover:bg-blue-700 gap-2">
              {callType === "ai" ? <Bot size={16} /> : <Cloud size={16} />}
              {callType === "ai" ? "Start AI Call" : "Call via Connect"}
            </Button>
          )}
          
          {(callStatus === "calling" || callStatus === "connected") && (
            <Button onClick={handleEndCall} variant="destructive" className="gap-2">
              <Phone size={16} />
              End Call
            </Button>
          )}
          
          {callStatus === "idle" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
