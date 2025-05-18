
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Phone } from "lucide-react";

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

  const handleCall = () => {
    setCallStatus("calling");
    
    // Simulate connecting after 2 seconds
    setTimeout(() => {
      setCallStatus("connected");
      
      // Start call timer
      const id = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      setIntervalId(id);
    }, 2000);
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
          <DialogTitle>Call {client.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-fixlyfy/10 flex items-center justify-center mb-2">
              <span className="text-2xl font-semibold">{client.name.charAt(0)}</span>
            </div>
            
            <h3 className="text-xl font-semibold">{client.name}</h3>
            <p className="text-fixlyfy-text-secondary">{client.phone || "No phone number available"}</p>
            
            {callStatus === "connected" && (
              <p className="text-green-500 animate-pulse">
                Call in progress - {formatDuration(callDuration)}
              </p>
            )}
            
            {callStatus === "calling" && (
              <p className="text-amber-500 animate-pulse">
                Calling...
              </p>
            )}
            
            {callStatus === "ended" && (
              <p className="text-red-500">
                Call ended - {formatDuration(callDuration)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          {callStatus === "idle" && (
            <Button onClick={handleCall} className="bg-green-500 hover:bg-green-600 gap-2">
              <Phone size={16} />
              Call
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
