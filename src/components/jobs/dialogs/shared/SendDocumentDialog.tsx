
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Send, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface SendDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  documentType: "estimate" | "invoice";
  documentId: string;
  documentNumber: string;
  total: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  onSend: (params: {
    sendMethod: "email" | "sms";
    sendTo: string;
    customNote: string;
  }) => Promise<{ success: boolean; error?: string }>;
  isProcessing?: boolean;
}

export const SendDocumentDialog = ({
  isOpen,
  onClose,
  onBack,
  documentType,
  documentId,
  documentNumber,
  total,
  contactInfo = { name: '', email: '', phone: '' },
  onSend,
  isProcessing = false
}: SendDocumentDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [validationError, setValidationError] = useState("");
  const isMobile = useIsMobile();

  // Validation helpers
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const hasValidEmail = contactInfo?.email && isValidEmail(contactInfo.email);
  const hasValidPhone = contactInfo?.phone && isValidPhoneNumber(contactInfo.phone);

  // Set default values when dialog opens or method changes
  useEffect(() => {
    if (isOpen) {
      setValidationError("");
      setCustomNote("");
      
      if (sendMethod === "email" && hasValidEmail) {
        setSendTo(contactInfo.email);
      } else if (sendMethod === "sms" && hasValidPhone) {
        setSendTo(contactInfo.phone);
      } else {
        setSendTo("");
      }
    }
  }, [isOpen, sendMethod, contactInfo, hasValidEmail, hasValidPhone]);

  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    setValidationError("");
    
    if (value === "email" && hasValidEmail) {
      setSendTo(contactInfo.email);
    } else if (value === "sms" && hasValidPhone) {
      setSendTo(contactInfo.phone);
    } else {
      setSendTo("");
    }
  };

  const validateForm = (): string | null => {
    if (!sendTo.trim()) {
      return `Please enter ${sendMethod === "email" ? "email address" : "phone number"}`;
    }

    if (sendMethod === "email" && !isValidEmail(sendTo.trim())) {
      return "Please enter a valid email address";
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo.trim())) {
      return "Please enter a valid phone number";
    }

    return null;
  };

  const handleSend = async () => {
    const validationErrorMsg = validateForm();
    if (validationErrorMsg) {
      setValidationError(validationErrorMsg);
      toast.error(validationErrorMsg);
      return;
    }

    try {
      const result = await onSend({
        sendMethod,
        sendTo: sendTo.trim(),
        customNote: customNote.trim()
      });

      if (result.success) {
        const method = sendMethod === "email" ? "email" : "text message";
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent via ${method}!`);
        onClose();
      } else {
        toast.error(result.error || `Failed to send ${documentType}`);
      }
    } catch (error: any) {
      console.error(`Error sending ${documentType}:`, error);
      toast.error(`Failed to send ${documentType}: ${error.message}`);
    }
  };

  const handleClose = () => {
    setSendTo("");
    setCustomNote("");
    setValidationError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${
        isMobile 
          ? 'w-[95vw] max-w-none h-[90vh] max-h-[90vh] m-2 p-0' 
          : 'sm:max-w-md max-h-[80vh]'
      } overflow-hidden`}>
        <DialogHeader className={`${isMobile ? 'p-4 pb-2' : 'p-6 pb-2'} border-b flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className={`${isMobile ? 'h-8 w-8 p-0' : ''}`}
                  disabled={isProcessing}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Send className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <DialogTitle className={`${isMobile ? 'text-base' : 'text-lg'} truncate`}>
                Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} #{documentNumber}
              </DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className={`${isMobile ? 'h-8 w-8 p-0' : ''} flex-shrink-0 ml-2`}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className={`${isMobile ? 'p-4 pt-2' : 'p-6 pt-4'} overflow-y-auto flex-1 space-y-4`}>
          {/* Document Summary */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-blue-800`}>
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            {contactInfo?.name && (
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-blue-800 truncate`}>
                <strong>Customer:</strong> {contactInfo.name}
              </p>
            )}
          </div>

          {/* Send Method Selection */}
          <div className="space-y-2">
            <Label className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              Send Method
            </Label>
            <Select value={sendMethod} onValueChange={handleSendMethodChange}>
              <SelectTrigger className={`${isMobile ? 'h-12' : 'h-10'} bg-white`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="email" disabled={!hasValidEmail}>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                    {!hasValidEmail && <span className="text-xs text-amber-600 ml-1">(No valid email)</span>}
                  </div>
                </SelectItem>
                <SelectItem value="sms" disabled={!hasValidPhone}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                    {!hasValidPhone && <span className="text-xs text-amber-600 ml-1">(No valid phone)</span>}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="sendTo" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="sendTo"
              type={sendMethod === "email" ? "email" : "tel"}
              placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890"}
              value={sendTo}
              onChange={(e) => {
                setSendTo(e.target.value);
                setValidationError("");
              }}
              className={`${isMobile ? 'h-12 text-base' : 'h-10'} ${validationError ? "border-red-500" : ""}`}
              disabled={isProcessing}
            />
            {validationError && (
              <p className="text-sm text-red-600 mt-1">{validationError}</p>
            )}
            {sendMethod === "sms" && (
              <p className="text-xs text-muted-foreground">
                Phone numbers will be automatically formatted
              </p>
            )}
          </div>

          {/* Custom Note */}
          <div className="space-y-2">
            <Label htmlFor="customNote" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              Custom Note (Optional)
            </Label>
            <Textarea
              id="customNote"
              placeholder="Add a personal note to include with the document..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={isMobile ? 3 : 3}
              className={`resize-none ${isMobile ? 'text-base' : ''}`}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`${isMobile ? 'p-4 pt-2' : 'p-6 pt-4'} border-t flex-shrink-0`}>
          <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <Button
              variant="outline"
              onClick={onBack || handleClose}
              className={`${isMobile ? 'h-12 text-base order-2' : 'flex-1'}`}
              disabled={isProcessing}
            >
              {onBack ? "Back" : "Cancel"}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isProcessing || !sendTo.trim() || !!validationError}
              className={`${isMobile ? 'h-12 text-base order-1' : 'flex-1'} gap-2`}
            >
              <Send className="h-4 w-4" />
              {isProcessing ? "Sending..." : `Send ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
