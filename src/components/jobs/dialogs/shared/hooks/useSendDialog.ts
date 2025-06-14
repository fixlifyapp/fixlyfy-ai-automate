
import { useState, useEffect, useCallback } from "react";
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
  
  console.log("=== useSendDialog HOOK ===");
  console.log("Hook params:", { documentType, documentNumber, documentId, isOpen });
  
  const { sendDocument, isProcessing } = useSendingHook();
  
  console.log("Sending hook state:", { isProcessing });

  // Memoize the effect logic to prevent infinite loops
  const updateSendTo = useCallback(() => {
    if (!isOpen) return;
    
    console.log("=== useSendDialog updateSendTo ===");
    console.log("Effect triggered:", { isOpen, sendMethod, contactInfo });
    
    if (sendMethod === "email" && contactInfo?.email && isValidEmail(contactInfo.email)) {
      console.log("Setting email default:", contactInfo.email);
      setSendTo(contactInfo.email);
    } else if (sendMethod === "sms" && contactInfo?.phone && isValidPhoneNumber(contactInfo.phone)) {
      console.log("Setting phone default:", contactInfo.phone);
      setSendTo(contactInfo.phone);
    } else {
      console.log("No valid default found, clearing sendTo");
      setSendTo("");
    }
  }, [isOpen, sendMethod, contactInfo?.email, contactInfo?.phone]);

  // Set default values when dialog opens or method changes
  useEffect(() => {
    updateSendTo();
  }, [updateSendTo]);

  const handleSend = useCallback(async () => {
    console.log("=== useSendDialog.handleSend START ===");
    console.log("Handle send called with:", {
      documentType,
      documentId,
      documentNumber,
      sendMethod,
      sendTo,
      total,
      customNote
    });

    if (!sendTo.trim()) {
      const errorMsg = `Please enter ${sendMethod === "email" ? "email address" : "phone number"}`;
      console.error("Validation error:", errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // Validate format
    if (sendMethod === "email" && !isValidEmail(sendTo.trim())) {
      console.error("Invalid email format:", sendTo);
      toast.error("Please enter a valid email address");
      return false;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo.trim())) {
      console.error("Invalid phone format:", sendTo);
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Validate document ID
    if (!documentId) {
      console.error("Missing document ID");
      toast.error(`${documentType} ID is required`);
      return false;
    }

    try {
      // Save document first if onSave is provided
      if (onSave) {
        console.log("Saving document before sending...");
        const saveSuccess = await onSave();
        if (!saveSuccess) {
          console.error("Save failed");
          toast.error("Failed to save document. Please try again.");
          return false;
        }
        console.log("Document saved successfully");
      }

      console.log("Preparing to call sendDocument...");
      const sendParams = {
        sendMethod,
        sendTo: sendTo.trim(),
        documentNumber,
        documentDetails: { 
          total: total,
          [documentType + '_number']: documentNumber
        },
        lineItems: [],
        contactInfo,
        customNote: customNote.trim(),
        jobId: documentId,
        existingDocumentId: documentId,
        onSave: onSave || (() => Promise.resolve(true))
      };
      console.log("Send parameters:", sendParams);

      console.log("Calling sendDocument function...");
      const result = await sendDocument(sendParams);
      console.log("sendDocument result:", result);

      if (result.success) {
        console.log(`${documentType} sent successfully!`);
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully!`);
        if (onSuccess) {
          console.log("Calling onSuccess callback");
          onSuccess();
        }
        return true;
      } else {
        const errorMessage = extractErrorMessage(result.error);
        console.error(`Failed to send ${documentType}:`, errorMessage);
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
    } finally {
      console.log("=== useSendDialog.handleSend END ===");
    }
  }, [
    documentType,
    documentId,
    documentNumber,
    sendMethod,
    sendTo,
    total,
    customNote,
    contactInfo,
    onSave,
    onSuccess,
    sendDocument
  ]);

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
