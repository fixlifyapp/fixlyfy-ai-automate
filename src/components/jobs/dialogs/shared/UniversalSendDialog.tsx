
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Mail, MessageSquare, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState("");

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
      setValidationError("Please enter a valid email address");
      return false;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      setValidationError("Please enter a valid phone number");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSend = async () => {
    if (!validateInput()) return;

    setIsProcessing(true);
    
    try {
      console.log(`🚀 Sending ${documentType} via ${sendMethod}...`);
      console.log(`Document ID: ${documentId}, Number: ${documentNumber}`);
      console.log(`Send to: ${sendTo}`);

      if (sendMethod === "email") {
        // Call email sending edge function
        const functionName = documentType === "estimate" ? "send-estimate" : "send-invoice";
        
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientEmail: sendTo,
            customMessage: customNote || undefined
          }
        });

        if (error) {
          console.error(`❌ Error from ${functionName}:`, error);
          throw new Error(error.message || `Failed to send ${documentType} via email`);
        }

        console.log(`✅ Email sent successfully:`, data);
        toast.success(`${documentType === "estimate" ? "Estimate" : "Invoice"} sent via email successfully!`);
        
      } else {
        // Use telnyx-sms for both estimates and invoices
        console.log("Calling telnyx-sms function for SMS...");
        
        // Get document details for client_id
        const tableName = documentType === "estimate" ? "estimates" : "invoices";
        const { data: document } = await supabase
          .from(tableName)
          .select('job_id, jobs!inner(client_id)')
          .eq('id', documentId)
          .single();

        const clientId = document?.jobs?.client_id;
        
        const smsMessage = customNote || `Hi ${contactInfo?.name || 'valued customer'}! Your ${documentType} ${documentNumber} is ready. Total: $${total.toFixed(2)}.`;
        
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            recipientPhone: sendTo,
            message: smsMessage,
            [`${documentType}Id`]: documentId,
            client_id: clientId,
            job_id: document?.job_id
          }
        });

        if (error) {
          console.error(`❌ Error from telnyx-sms:`, error);
          throw new Error(error.message || `Failed to send ${documentType} via SMS`);
        }

        console.log(`✅ SMS sent successfully:`, data);
        toast.success(`${documentType === "estimate" ? "Estimate" : "Invoice"} sent via SMS successfully!`);
      }

      // Always close the dialog after successful send
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error(`❌ Failed to send ${documentType}:`, error);
      toast.error(`Failed to send ${documentType}: ${error.message}`);
    } finally {
      setIsProcessing(false);
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

          {/* Send Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose sending method:</Label>
            <RadioGroup value={sendMethod} onValueChange={(value: "email" | "sms") => setSendMethod(value)}>
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                sendMethod === "email" ? "border-blue-200 bg-blue-50" : "border-gray-200"
              } ${!hasValidEmail ? "opacity-50" : ""}`}>
                <RadioGroupItem value="email" id="email" disabled={!hasValidEmail} />
                <Mail className="h-4 w-4" />
                <Label htmlFor="email" className="flex-1 cursor-pointer">
                  Email
                  {!hasValidEmail && <span className="text-red-500 text-xs ml-2">(No valid email)</span>}
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                sendMethod === "sms" ? "border-blue-200 bg-blue-50" : "border-gray-200"
              } ${!hasValidPhone ? "opacity-50" : ""}`}>
                <RadioGroupItem value="sms" id="sms" disabled={!hasValidPhone} />
                <MessageSquare className="h-4 w-4" />
                <Label htmlFor="sms" className="flex-1 cursor-pointer">
                  SMS
                  {!hasValidPhone && <span className="text-red-500 text-xs ml-2">(No valid phone)</span>}
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
              placeholder={sendMethod === "email" ? "Enter email address" : "Enter phone number"}
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
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="customNote">Custom Message (Optional)</Label>
            <Textarea
              id="customNote"
              placeholder="Add a custom message..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={handleSend}
              disabled={isProcessing || !sendTo.trim()}
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
