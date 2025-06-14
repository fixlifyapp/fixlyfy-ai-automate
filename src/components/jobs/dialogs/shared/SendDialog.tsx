
import React from "react";
import { Button } from "@/components/ui/button";
import { SendingHookReturn } from "./hooks/useSendingInterface";
import { SendDialogHeader } from "./components/SendDialogHeader";
import { DocumentPreview } from "./components/DocumentPreview";
import { SendMethodSelector } from "./components/SendMethodSelector";
import { SendForm } from "./components/SendForm";
import { useSendDialog } from "./hooks/useSendDialog";

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
  useSendingHook: () => SendingHookReturn;
}

export const SendDialog = ({ 
  isOpen,
  onClose,
  documentId,
  documentType, 
  documentNumber, 
  total,
  contactInfo = { name: '', email: '', phone: '' },
  onSuccess,
  onSave,
  useSendingHook
}: SendDialogProps) => {
  console.log("=== SendDialog RENDER ===");
  console.log("SendDialog props:", {
    isOpen,
    documentId,
    documentType,
    documentNumber,
    total,
    contactInfo
  });

  const {
    sendMethod,
    setSendMethod,
    sendTo,
    setSendTo,
    customNote,
    setCustomNote,
    isProcessing,
    handleSend
  } = useSendDialog({
    isOpen,
    documentType,
    documentNumber,
    total,
    contactInfo,
    documentId,
    onSuccess,
    onSave,
    useSendingHook
  });

  const handleSendClick = async () => {
    console.log("=== SEND BUTTON CLICKED ===");
    console.log("Button click handler starting...");
    console.log("Current state:", {
      sendMethod,
      sendTo,
      customNote,
      isProcessing,
      documentId,
      documentNumber
    });
    
    try {
      console.log("Calling handleSend...");
      const success = await handleSend();
      console.log("handleSend returned:", success);
      
      if (success) {
        console.log("Send successful, closing dialog");
        onClose();
      } else {
        console.log("Send failed, keeping dialog open");
      }
    } catch (error) {
      console.error("Error in handleSendClick:", error);
    }
    
    console.log("=== SEND BUTTON CLICK COMPLETE ===");
  };

  console.log("SendDialog state:", {
    sendMethod,
    sendTo,
    customNote,
    isProcessing,
    canSend: !isProcessing && sendTo.trim() && documentId
  });

  if (!isOpen) {
    console.log("SendDialog not open, returning null");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <SendDialogHeader
          documentType={documentType}
          documentNumber={documentNumber}
          onClose={onClose}
        />

        <div className="p-6 space-y-4">
          <DocumentPreview
            documentType={documentType}
            documentNumber={documentNumber}
            total={total}
            contactInfo={contactInfo}
          />

          <SendMethodSelector
            sendMethod={sendMethod}
            onSendMethodChange={setSendMethod}
          />

          <SendForm
            sendMethod={sendMethod}
            sendTo={sendTo}
            onSendToChange={setSendTo}
            customNote={customNote}
            onCustomNoteChange={setCustomNote}
          />
        </div>

        <div className="p-6 border-t flex gap-2">
          <Button
            onClick={handleSendClick}
            disabled={isProcessing || !sendTo.trim() || !documentId}
            className="flex-1"
          >
            {isProcessing ? "Sending..." : `Send ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
