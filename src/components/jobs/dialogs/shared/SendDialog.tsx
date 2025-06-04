
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SendMethodStep } from "../estimate-builder/steps/SendMethodStep";

interface SendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentNumber: string;
  documentType: "estimate" | "invoice";
  total: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess?: () => void;
  onSave?: () => Promise<boolean>;
  useSendingHook: (params: any) => { sendDocument: (params: any) => Promise<any>; isProcessing: boolean };
}

export const SendDialog = ({ 
  isOpen, 
  onClose, 
  documentId, 
  documentNumber, 
  documentType,
  total,
  contactInfo,
  onSuccess,
  onSave,
  useSendingHook
}: SendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [validationError, setValidationError] = useState("");
  const [sentMethods, setSentMethods] = useState<Set<string>>(new Set());
  const { sendDocument, isProcessing } = useSendingHook();

  // Fetch user's Telnyx phone numbers
  const { data: userPhoneNumbers = [] } = useQuery({
    queryKey: ['user-telnyx-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'active')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Helper functions for validation
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  // Check if contact info has valid email/phone
  const hasValidEmail = contactInfo?.email && isValidEmail(contactInfo.email);
  const hasValidPhone = contactInfo?.phone && isValidPhoneNumber(contactInfo.phone);

  // Set default sendTo value when dialog opens or method changes
  React.useEffect(() => {
    if (isOpen) {
      if (sendMethod === "email" && hasValidEmail) {
        setSendTo(contactInfo.email);
      } else if (sendMethod === "sms" && hasValidPhone) {
        setSendTo(contactInfo.phone);
      } else {
        setSendTo("");
      }
      setValidationError("");
    }
  }, [isOpen, sendMethod, hasValidEmail, hasValidPhone, contactInfo]);

  const handleSend = async () => {
    const result = await sendDocument({
      sendMethod,
      sendTo,
      documentNumber,
      documentDetails: { [documentType === "estimate" ? "estimate_number" : "invoice_number"]: documentNumber },
      lineItems: [],
      contactInfo: contactInfo || { name: '', email: '', phone: '' },
      customNote: "",
      jobId: documentId,
      onSave: onSave || (() => Promise.resolve(true)),
      existingDocumentId: documentId
    });

    if (result.success) {
      // Mark this method as sent
      setSentMethods(prev => new Set([...prev, sendMethod]));
      
      // If both methods have been used, close dialog
      if (sentMethods.size === 1) {
        // Show success message and option to send via other method
        const otherMethod = sendMethod === "email" ? "SMS" : "email";
        const hasOtherMethod = sendMethod === "email" ? hasValidPhone : hasValidEmail;
        
        if (hasOtherMethod) {
          toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent via ${sendMethod}! You can also send via ${otherMethod} if needed.`);
        } else {
          // No other method available, close dialog
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
          }
        }
      } else {
        // Both methods used, close dialog
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    }
  };

  const handleBack = () => {
    onClose();
  };

  const handleClose = () => {
    setSentMethods(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} #{documentNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            {contactInfo?.name && (
              <p className="text-sm text-blue-800 truncate">
                <strong>Customer:</strong> {contactInfo.name}
              </p>
            )}
            {sentMethods.size > 0 && (
              <p className="text-sm text-green-800 mt-2">
                <strong>Sent via:</strong> {Array.from(sentMethods).join(", ")}
              </p>
            )}
            <div className="bg-green-50 border border-green-200 p-2 rounded mt-2">
              <p className="text-xs text-green-700">
                <strong>✅ {documentType.charAt(0).toUpperCase() + documentType.slice(1)} Saved:</strong> This {documentType} has been saved and is available in your {documentType}s list.
              </p>
            </div>
          </div>

          <SendMethodStep
            sendMethod={sendMethod}
            setSendMethod={setSendMethod}
            sendTo={sendTo}
            setSendTo={setSendTo}
            validationError={validationError}
            setValidationError={setValidationError}
            contactInfo={contactInfo || { name: '', email: '', phone: '' }}
            hasValidEmail={!!hasValidEmail}
            hasValidPhone={!!hasValidPhone}
            estimateNumber={documentNumber}
            isProcessing={isProcessing}
            onSend={handleSend}
            onBack={handleBack}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
