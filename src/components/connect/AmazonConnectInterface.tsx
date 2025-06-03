
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneOff, Clock, Bot } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";

interface ActiveCall {
  contactId: string;
  toNumber: string;
  fromNumber: string;
  status: string;
  startTime: Date;
}

export const AmazonConnectInterface = () => {
  const { config, awsCredentials } = useAIAgentConfig();
  const [toNumber, setToNumber] = useState<string>("");
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState(0);

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    if (!toNumber) {
      toast.error("Please enter a phone number to call");
      return;
    }

    if (!config?.connect_instance_arn) {
      toast.error("Amazon Connect instance not configured");
      return;
    }

    if (!awsCredentials) {
      toast.error("AWS credentials not configured");
      return;
    }

    try {
      toast.info("Initiating Amazon Connect call...");
      
      const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
        body: {
          action: 'initiate',
          fromNumber: config.connect_instance_arn,
          toNumber: toNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        setActiveCall({
          contactId: data.contactId,
          toNumber: toNumber,
          fromNumber: config.connect_instance_arn,
          status: data.status,
          startTime: new Date()
        });
        
        toast.success("Amazon Connect call initiated successfully");
        
        // Poll for call status updates
        pollCallStatus(data.contactId);
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (error) {
      console.error('Error initiating Amazon Connect call:', error);
      toast.error('Failed to initiate call via Amazon Connect');
    }
  };

  const pollCallStatus = async (contactId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
          body: {
            action: 'status',
            contactId: contactId
          }
        });

        if (error) throw error;

        if (data.success) {
          setActiveCall(prev => prev ? { ...prev, status: data.status } : null);
          
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'no-answer') {
            clearInterval(pollInterval);
            setActiveCall(null);
            setCallDuration(0);
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
      const { data, error } = await supabase.functions.invoke('amazon-connect-calls', {
        body: {
          action: 'hangup',
          contactId: activeCall.contactId
        }
      });

      if (error) throw error;

      setActiveCall(null);
      setCallDuration(0);
      toast.success("Call ended via Amazon Connect");
    } catch (error) {
      console.error('Error hanging up call:', error);
      toast.error('Failed to end call');
    }
  };

  const isConfigured = config?.connect_instance_arn && awsCredentials;

  return (
    <Card className="border-fixlyfy-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Amazon Connect AI Calling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Amazon Connect Not Configured</h3>
            <p className="text-sm">
              Please configure your Amazon Connect instance and AWS credentials in Settings → Integrations
            </p>
          </div>
        ) : !activeCall ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Call Number</label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Calls will be handled by Amazon Connect AI Agent
              </p>
            </div>

            <Button 
              onClick={initiateCall}
              disabled={!toNumber || !isConfigured}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Phone size={16} className="mr-2" />
              Call via Amazon Connect
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold mb-2">
                {activeCall.status === 'initiated' && 'Connecting...'}
                {activeCall.status === 'ringing' && 'Ringing...'}
                {activeCall.status === 'in-progress' && 'Call Active'}
                {activeCall.status === 'completed' && 'Call Ended'}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>To: {formatPhoneNumber(activeCall.toNumber)}</div>
                <div className="text-xs text-blue-600">Via Amazon Connect AI Agent</div>
                {activeCall.status === 'in-progress' && (
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-mono">
                    <Clock size={14} />
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
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
