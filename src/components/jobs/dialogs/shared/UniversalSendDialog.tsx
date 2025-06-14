
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Send, Mail, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail, isValidPhoneNumber } from "../shared/utils/validationUtils";

interface UniversalSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: "estimate" | "invoice";
  documentId: string;
  documentNumber: string;
  total: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess?: () => void;
}

export const UniversalSendDialog = ({
  isOpen,
  onClose,
  documentType,
  documentId,
  documentNumber,
  total,
  contactInfo = { name: '', email: '', phone: '' },
  onSuccess
}: UniversalSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [recipient, setRecipient] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  console.log("=== UniversalSendDialog ===");
  console.log("Props:", { documentType, documentId, documentNumber, total, contactInfo });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log("Dialog opened, setting defaults");
      if (sendMethod === "email" && contactInfo?.email && isValidEmail(contactInfo.email)) {
        setRecipient(contactInfo.email);
      } else if (sendMethod === "sms" && contactInfo?.phone && isValidPhoneNumber(contactInfo.phone)) {
        setRecipient(contactInfo.phone);
      } else {
        setRecipient("");
      }
      setCustomMessage("");
    }
  }, [isOpen, sendMethod, contactInfo]);

  const validateRecipient = () => {
    if (!recipient.trim()) {
      toast.error(`Please enter ${sendMethod === "email" ? "email address" : "phone number"}`);
      return false;
    }

    if (sendMethod === "email" && !isValidEmail(recipient.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(recipient.trim())) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    console.log("=== SEND STARTED ===");
    console.log("Send params:", { sendMethod, recipient, documentType, documentId });

    if (!validateRecipient()) return;

    setIsLoading(true);

    try {
      let response;
      
      if (sendMethod === "email") {
        console.log("Sending email...");
        const functionName = documentType === "estimate" ? "send-estimate" : "send-invoice";
        
        response = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientEmail: recipient.trim(),
            subject: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber}`,
            message: customMessage || `Please find your ${documentType} ${documentNumber}. Total: $${total.toFixed(2)}.`
          }
        });
      } else {
        console.log("Sending SMS...");
        const functionName = documentType === "estimate" ? "send-estimate-sms" : "send-invoice-sms";
        const smsMessage = customMessage || `Hi ${contactInfo.name}! Your ${documentType} ${documentNumber} is ready. Total: $${total.toFixed(2)}.`;
        
        response = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientPhone: recipient.trim(),
            message: smsMessage
          }
        });
      }

      console.log("Response:", response);

      if (response.error) {
        console.error("Function error:", response.error);
        throw new Error(response.error.message || `Failed to send ${documentType}`);
      }

      if (response.data?.success) {
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(response.data?.error || `Failed to send ${documentType}`);
      }
    } catch (error: any) {
      console.error("Send error:", error);
      toast.error(`Failed to send ${documentType}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} #{documentNumber}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Summary */}
          <Card className="p-3 bg-blue-50">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                <strong>Total:</strong> ${total.toFixed(2)}
              </p>
              {contactInfo.name && (
                <p className="text-sm">
                  <strong>Customer:</strong> {contactInfo.name}
                </p>
              )}
            </div>
          </Card>

          {/* Send Method */}
          <div className="space-y-2">
            <Label>Send Method</Label>
            <Select value={sendMethod} onValueChange={(value: "email" | "sms") => setSendMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              type={sendMethod === "email" ? "email" : "tel"}
              placeholder={sendMethod === "email" ? "Enter email address" : "Enter phone number"}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label>Custom Message (Optional)</Label>
            <Textarea
              placeholder={`Add a custom message for your ${documentType}...`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !recipient.trim() || !documentId}
            className="flex-1"
          >
            {isLoading ? "Sending..." : `Send ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
