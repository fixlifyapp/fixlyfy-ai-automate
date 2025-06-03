
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateNumber: string;
  estimateDetails?: any;
  lineItems?: any[];
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  jobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSave: () => Promise<boolean>;
}

export const EstimateSendDialog = ({ 
  open, 
  onOpenChange, 
  estimateNumber,
  estimateDetails,
  lineItems,
  contactInfo,
  clientInfo,
  jobId,
  onSuccess,
  onCancel,
  onSave
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Use clientInfo or contactInfo, whichever is available
  const finalContactInfo = clientInfo || contactInfo || { name: '', email: '', phone: '' };

  // Set default recipient when dialog opens
  useEffect(() => {
    if (open && finalContactInfo) {
      setSendTo(sendMethod === "email" ? (finalContactInfo.email || "") : (finalContactInfo.phone || ""));
    }
  }, [open, sendMethod, finalContactInfo]);

  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    if (finalContactInfo) {
      setSendTo(value === "email" ? (finalContactInfo.email || "") : (finalContactInfo.phone || ""));
    }
  };

  const sendViaEmail = async () => {
    try {
      // Get estimate data first
      const { data: estimates } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .single();

      if (!estimates) {
        throw new Error('Estimate not found');
      }

      // Send via the existing send-estimate function
      const { data, error } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: estimates.id,
          recipientEmail: sendTo,
          sendMethod: 'email',
          message: customNote,
          subject: `Estimate ${estimateNumber} from your service provider`
        }
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  };

  const sendViaSMS = async () => {
    try {
      // Get estimate data first
      const { data: estimates } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .single();

      if (!estimates) {
        throw new Error('Estimate not found');
      }

      // Send via the existing send-estimate function
      const { data, error } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: estimates.id,
          recipientPhone: sendTo,
          sendMethod: 'sms',
          message: customNote
        }
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('SMS send error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  };

  const handleSend = async () => {
    console.log("=== SEND ESTIMATE CLICKED ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Custom note:", customNote);

    if (!sendTo.trim()) {
      toast.error("Please enter a recipient");
      return;
    }

    setIsProcessing(true);

    try {
      let result;
      
      if (sendMethod === "email") {
        result = await sendViaEmail();
      } else {
        result = await sendViaSMS();
      }

      if (result.success) {
        toast.success(`Estimate sent successfully via ${sendMethod}!`);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Send failed:", error);
      toast.error(error.message || `Failed to send via ${sendMethod}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    console.log("Send cancelled");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Estimate {estimateNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Send Method</Label>
            <RadioGroup 
              value={sendMethod} 
              onValueChange={handleSendMethodChange}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="sendTo">
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="sendTo"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890"}
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="customNote">Custom Message (Optional)</Label>
            <Textarea
              id="customNote"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Add a personal message to your estimate..."
              rows={3}
              disabled={isProcessing}
            />
          </div>

          {/* Client Info Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Sending to:</h4>
            <div className="text-sm text-gray-600">
              <p><strong>{finalContactInfo.name}</strong></p>
              <p>Email: {finalContactInfo.email || 'Not provided'}</p>
              <p>Phone: {finalContactInfo.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isProcessing || !sendTo.trim()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              `Send via ${sendMethod === "email" ? "Email" : "SMS"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
