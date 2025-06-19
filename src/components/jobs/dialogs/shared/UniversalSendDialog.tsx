
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Mail, MessageSquare, ArrowLeft, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentSending } from "@/hooks/useDocumentSending";

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
  contactInfo,
  onSuccess
}: UniversalSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [validationError, setValidationError] = useState("");

  const { sendDocument, isProcessing } = useDocumentSending();

  // Set default values when dialog opens
  useEffect(() => {
    if (isOpen && contactInfo) {
      if (sendMethod === "email" && contactInfo.email) {
        setSendTo(contactInfo.email);
      } else if (sendMethod === "sms" && contactInfo.phone) {
        setSendTo(contactInfo.phone);
      } else {
        setSendTo("");
      }
      setValidationError("");
    }
  }, [isOpen, sendMethod, contactInfo]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSendTo("");
      setCustomNote("");
      setValidationError("");
      setSendMethod("email");
    }
  }, [isOpen]);

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const validateInput = (): boolean => {
    if (!sendTo.trim()) {
      setValidationError(`Please enter a ${sendMethod === "email" ? "email address" : "phone number"}`);
      return false;
    }

    if (sendMethod === "email" && !isValidEmail(sendTo)) {
      setValidationError("Please enter a valid email address (e.g., client@example.com)");
      return false;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      setValidationError("Please enter a valid phone number (e.g., +1234567890 or (555) 123-4567)");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSend = async () => {
    if (!validateInput()) return;

    const result = await sendDocument({
      documentType,
      documentId,
      sendMethod,
      sendTo,
      customMessage: customNote || undefined,
      contactInfo
    });

    if (result.success) {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const hasValidEmail = contactInfo?.email && isValidEmail(contactInfo.email);
  const hasValidPhone = contactInfo?.phone && isValidPhoneNumber(contactInfo.phone);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Send {documentType === "estimate" ? "Estimate" : "Invoice"} #{documentNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Summary */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            {contactInfo?.name && (
              <p className="text-sm text-blue-800 truncate">
                <strong>Customer:</strong> {contactInfo.name}
              </p>
            )}
          </div>

          {/* Service Status Alert */}
          {(!hasValidEmail && !hasValidPhone) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No valid contact information found for this client. Please enter the recipient details manually.
              </AlertDescription>
            </Alert>
          )}

          {/* Send Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose sending method:</Label>
            <RadioGroup value={sendMethod} onValueChange={(value: "email" | "sms") => setSendMethod(value)}>
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                sendMethod === "email" ? "border-blue-200 bg-blue-50" : "border-gray-200"
              } ${!hasValidEmail ? "opacity-50" : ""}`}>
                <RadioGroupItem value="email" id="email" disabled={!hasValidEmail && !sendTo} />
                <Mail className="h-4 w-4" />
                <Label htmlFor="email" className="flex-1 cursor-pointer">
                  Email
                  {!hasValidEmail && <span className="text-amber-600 text-xs ml-2">(No valid email on file)</span>}
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                sendMethod === "sms" ? "border-blue-200 bg-blue-50" : "border-gray-200"
              } ${!hasValidPhone ? "opacity-50" : ""}`}>
                <RadioGroupItem value="sms" id="sms" disabled={!hasValidPhone && !sendTo} />
                <MessageSquare className="h-4 w-4" />
                <Label htmlFor="sms" className="flex-1 cursor-pointer">
                  SMS (Text Message)
                  {!hasValidPhone && <span className="text-amber-600 text-xs ml-2">(No valid phone on file)</span>}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="sendTo">
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="sendTo"
              type={sendMethod === "email" ? "email" : "tel"}
              placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890 or (555) 123-4567"}
              value={sendTo}
              onChange={(e) => {
                setSendTo(e.target.value);
                setValidationError("");
              }}
              className={validationError ? "border-red-500" : ""}
            />
            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}
            {sendMethod === "sms" && (
              <p className="text-xs text-muted-foreground">
                Phone numbers will be automatically formatted for delivery
              </p>
            )}
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="customNote">Custom Message (Optional)</Label>
            <Textarea
              id="customNote"
              placeholder="Add a personal message..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              A secure portal link will be automatically included for client access.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={handleSend}
              disabled={isProcessing || !sendTo.trim() || !!validationError}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send {sendMethod === "email" ? "Email" : "SMS"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
