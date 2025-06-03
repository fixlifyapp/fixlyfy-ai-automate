
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
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

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

  const handleSend = async () => {
    console.log("=== SEND ESTIMATE CLICKED ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Custom note:", customNote);
    console.log("Job ID:", jobId);
    console.log("Estimate number:", estimateNumber);

    if (!sendTo.trim()) {
      toast.error("Please enter a recipient");
      return;
    }

    // Validate email/phone
    if (sendMethod === "email" && !sendTo.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Save the estimate first
      console.log("Step 1: Saving estimate...");
      const saveSuccess = await onSave();
      
      if (!saveSuccess) {
        console.error("Failed to save estimate");
        toast.error("Failed to save estimate. Please try again.");
        return;
      }

      console.log("Step 2: Estimate saved successfully");
      
      // Wait a moment for the estimate to be fully saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Get the saved estimate from database
      const { data: savedEstimate, error: fetchError } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, status, notes, job_id')
        .eq('estimate_number', estimateNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !savedEstimate) {
        console.error("Failed to fetch saved estimate:", fetchError);
        toast.error("Estimate not found after saving. Please try again.");
        return;
      }

      console.log("Step 3: Retrieved saved estimate:", savedEstimate);

      // Step 4: Send via appropriate method
      if (sendMethod === "sms") {
        // Format phone number for Telnyx
        const formattedPhone = formatPhoneForTelnyx(sendTo);
        console.log("Formatted phone number:", formattedPhone);
        
        const smsMessage = customNote || `Hi ${finalContactInfo.name}! Your estimate ${estimateNumber} is ready. Total: $${savedEstimate.total.toFixed(2)}. Please contact us if you have any questions.`;
        
        console.log("Sending SMS via Telnyx:", {
          to: formattedPhone,
          body: smsMessage,
          jobId: jobId
        });

        const { data: smsData, error: smsError } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: formattedPhone,
            body: smsMessage,
            client_id: jobId || null,
            job_id: jobId || null
          }
        });

        if (smsError || !smsData?.success) {
          console.error("SMS sending failed:", smsError || smsData);
          toast.error(`Failed to send SMS: ${smsError?.message || smsData?.error || 'Unknown error'}`);
          return;
        }

        console.log("SMS sent successfully:", smsData);
        toast.success(`Estimate ${estimateNumber} sent via SMS to ${finalContactInfo.name}`);
      } else {
        // Send via email using send-estimate function
        console.log("Sending email via send-estimate function");
        
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId: savedEstimate.id,
            sendMethod: 'email',
            recipientEmail: sendTo,
            subject: `Estimate ${estimateNumber} from your service provider`,
            message: customNote || `Please find your estimate ${estimateNumber}. Total: $${savedEstimate.total.toFixed(2)}.`
          }
        });
        
        if (emailError || !emailData?.success) {
          console.error("Email sending failed:", emailError || emailData);
          toast.error(`Failed to send email: ${emailError?.message || emailData?.error || 'Unknown error'}`);
          return;
        }

        console.log("Email sent successfully:", emailData);
        toast.success(`Estimate ${estimateNumber} sent via email to ${finalContactInfo.name}`);
      }

      // Step 5: Update estimate status to 'sent'
      await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', savedEstimate.id);

      console.log("Estimate status updated to 'sent'");

      // Step 6: Close dialog and navigate
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }

      // Add a small delay before showing success message
      setTimeout(() => {
        toast.success("Estimate sent successfully and status updated!");
      }, 500);

    } catch (error: any) {
      console.error("CRITICAL ERROR in send estimate process:", error);
      toast.error(`An error occurred while sending the estimate: ${error.message}`);
    } finally {
      setIsProcessing(false);
      console.log("=== ESTIMATE SEND PROCESS COMPLETED ===");
    }
  };

  const handleCancel = () => {
    console.log("Send cancelled");
    onOpenChange(false);
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
