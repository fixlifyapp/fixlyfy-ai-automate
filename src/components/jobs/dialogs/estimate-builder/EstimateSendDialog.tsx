
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { SendMethodStep } from "./steps/SendMethodStep";
import { useEstimateSendingInterface } from "../shared/hooks/useSendingInterface";
import { useJobData } from "../unified/hooks/useJobData";

interface EstimateSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  estimateNumber: string;
  total: number;
  jobId?: string;
  onSuccess?: () => void;
  onSave?: () => Promise<boolean>;
}

export const EstimateSendDialog = ({ 
  isOpen, 
  onClose, 
  estimateId, 
  estimateNumber, 
  total,
  jobId,
  onSuccess,
  onSave
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [validationError, setValidationError] = useState("");
  const [sentMethods, setSentMethods] = useState<Set<string>>(new Set());
  const { sendDocument, isProcessing } = useEstimateSendingInterface();

  // Fetch job and client data using the optimized hook
  const { clientInfo, jobAddress, loading: jobDataLoading } = useJobData(jobId || '');

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

  // Create contact info from fetched data
  const contactInfo = {
    name: clientInfo?.name || 'Client',
    email: clientInfo?.email || '',
    phone: clientInfo?.phone || ''
  };

  // Check if contact info has valid email/phone
  const hasValidEmail = contactInfo?.email && isValidEmail(contactInfo.email);
  const hasValidPhone = contactInfo?.phone && isValidPhoneNumber(contactInfo.phone);

  // Set default sendTo value when dialog opens or method changes
  React.useEffect(() => {
    if (isOpen && !jobDataLoading) {
      if (sendMethod === "email" && hasValidEmail) {
        setSendTo(contactInfo.email);
      } else if (sendMethod === "sms" && hasValidPhone) {
        setSendTo(contactInfo.phone);
      } else {
        setSendTo("");
      }
      setValidationError("");
    }
  }, [isOpen, sendMethod, hasValidEmail, hasValidPhone, contactInfo, jobDataLoading]);

  const handleSend = async () => {
    const result = await sendDocument({
      sendMethod,
      sendTo,
      documentNumber: estimateNumber,
      documentDetails: { estimate_number: estimateNumber },
      lineItems: [],
      contactInfo,
      customNote: "",
      jobId: estimateId,
      onSave: onSave || (() => Promise.resolve(true)),
      existingDocumentId: estimateId
    });

    if (result.success) {
      setSentMethods(prev => new Set([...prev, sendMethod]));
      
      if (sentMethods.size === 1) {
        const otherMethod = sendMethod === "email" ? "SMS" : "email";
        const hasOtherMethod = sendMethod === "email" ? hasValidPhone : hasValidEmail;
        
        if (!hasOtherMethod) {
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
          }
        }
      } else {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    }
  };

  const handleClose = () => {
    setSentMethods(new Set());
    onClose();
  };

  if (jobDataLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading client information...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Send Estimate #{estimateNumber}</span>
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
                <strong>✅ Estimate Saved:</strong> This estimate has been saved and is available in your estimates list.
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
            contactInfo={contactInfo}
            hasValidEmail={!!hasValidEmail}
            hasValidPhone={!!hasValidPhone}
            estimateNumber={estimateNumber}
            isProcessing={isProcessing}
            onSend={handleSend}
            onBack={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
