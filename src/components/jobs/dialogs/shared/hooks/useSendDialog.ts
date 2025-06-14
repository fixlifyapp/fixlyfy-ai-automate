
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { isValidEmail, isValidPhoneNumber } from "../utils/validationUtils";
import { extractErrorMessage } from "../utils/errorUtils";
import { SendingHookReturn } from "./useSendingInterface";

interface UseSendDialogProps {
  isOpen: boolean;
  documentType: "estimate" | "invoice";
  documentNumber: string;
  total: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  documentId: string;
  onSuccess?: () => void;
  onSave?: () => Promise<boolean>;
  useSendingHook: () => SendingHookReturn;
}

export const useSendDialog = ({
  isOpen,
  documentType,
  documentNumber,
  total,
  contactInfo = { name: '', email: '', phone: '' },
  documentId,
  onSuccess,
  onSave,
  useSendingHook
}: UseSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const { sendDocument, isProcessing } = useSendingHook();

  // Set default values when dialog opens or method changes
  useEffect(() => {
    if (isOpen) {
      if (sendMethod === "email" && contactInfo?.email && isValidEmail(contactInfo.email)) {
        setSendTo(contactInfo.email);
      } else if (sendMethod === "sms" && contactInfo?.phone && isValidPhoneNumber(contactInfo.phone)) {
        setSendTo(contactInfo.phone);
      } else {
        setSendTo("");
      }
    }
  }, [isOpen, sendMethod, contactInfo]);

  const handleSend = async () => {
    if (!sendTo.trim()) {
      toast.error(`Please enter ${sendMethod === "email" ? "email address" : "phone number"}`);
      return false;
    }

    // Validate format
    if (sendMethod === "email" && !isValidEmail(sendTo.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo.trim())) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    try {
      console.log("=== SENDING DOCUMENT ===");
      console.log("Document type:", documentType);
      console.log("Document ID:", documentId);
      console.log("Document number:", documentNumber);
      console.log("Send method:", sendMethod);
      console.log("Send to:", sendTo);

      // Save document first if onSave is provided
      if (onSave) {
        console.log("Saving document before sending...");
        const saveSuccess = await onSave();
        if (!saveSuccess) {
          toast.error("Failed to save document. Please try again.");
          return false;
        }
      }

      // Call the sendDocument function with proper parameters
      const result = await sendDocument({
        sendMethod,
        sendTo: sendTo.trim(),
        documentNumber,
        documentDetails: { 
          [documentType + '_number']: documentNumber,
          total: total
        },
        lineItems: [],
        contactInfo,
        customNote: customNote.trim(),
        jobId: documentId,
        existingDocumentId: documentId,
        onSave: onSave || (() => Promise.resolve(true))
      });

      console.log("Send result:", result);

      if (result.success) {
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully!`);
        if (onSuccess) {
          onSuccess();
        }
        return true;
      } else {
        const errorMessage = extractErrorMessage(result.error);
        console.error(`Failed to send ${documentType}: ${errorMessage}`);
        toast.error(`Failed to send ${documentType}: ${errorMessage}`);
        return false;
      }
    } catch (error: any) {
      console.error(`Error sending ${documentType}:`, error);
      const errorMessage = extractErrorMessage(
        error?.message ||
        (error?.error && error.error?.message) ||
        error?.error ||
        error
      );
      toast.error(`Failed to send ${documentType}: ${errorMessage}`);
      return false;
    }
  };

  return {
    sendMethod,
    setSendMethod,
    sendTo,
    setSendTo,
    customNote,
    setCustomNote,
    isProcessing,
    handleSend
  };
};
