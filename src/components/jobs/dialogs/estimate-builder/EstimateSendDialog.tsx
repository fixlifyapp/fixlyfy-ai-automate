
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { useEstimateSending } from "./hooks/useEstimateSending";
import { Product } from "../../builder/types";

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateNumber: string;
  estimateDetails: any;
  lineItems: any[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  jobId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onSave: () => Promise<boolean>;
  onAddWarranty?: (warranty: Product | null, note: string) => void;
}

export const EstimateSendDialog = ({ 
  open, 
  onOpenChange, 
  estimateNumber,
  estimateDetails,
  lineItems,
  contactInfo,
  jobId,
  onSuccess,
  onCancel,
  onSave
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const { sendEstimate, isProcessing } = useEstimateSending();

  // Set default recipient when dialog opens
  useEffect(() => {
    if (open && contactInfo) {
      setSendTo(sendMethod === "email" ? (contactInfo.email || "") : (contactInfo.phone || ""));
    }
  }, [open, sendMethod, contactInfo]);

  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    if (contactInfo) {
      setSendTo(value === "email" ? (contactInfo.email || "") : (contactInfo.phone || ""));
    }
  };

  const handleSend = async () => {
    console.log("=== SEND ESTIMATE CLICKED ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Custom note:", customNote);
    console.log("Contact info:", contactInfo);
    console.log("Job ID:", jobId);

    if (!sendTo.trim()) {
      console.error("No recipient specified");
      return;
    }

    const result = await sendEstimate({
      sendMethod,
      sendTo,
      estimateNumber,
      estimateDetails,
      lineItems,
      contactInfo,
      customNote,
      jobId,
      onSave
    });

    if (result.success) {
      console.log("Send successful, calling onSuccess");
      onSuccess();
    } else {
      console.error("Send failed:", result.error);
    }
  };

  const handleCancel = () => {
    console.log("Send cancelled");
    onCancel();
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
