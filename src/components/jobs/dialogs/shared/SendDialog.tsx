
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Send, ArrowLeft, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SendingHookReturn } from "./hooks/useSendingInterface";
import { SendMethodDialog } from "./SendMethodDialog";

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
  onDelete?: () => Promise<boolean>;
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
  onDelete,
  useSendingHook
}: SendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { sendDocument, isProcessing } = useSendingHook();

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

  // Set default values when dialog opens or method changes
  React.useEffect(() => {
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

  const handleSendClick = () => {
    const hasEmail = contactInfo?.email && isValidEmail(contactInfo.email);
    const hasPhone = contactInfo?.phone && isValidPhoneNumber(contactInfo.phone);
    
    // If both email and phone are available, show method selection dialog
    if (hasEmail && hasPhone) {
      setShowMethodDialog(true);
    } else if (hasEmail) {
      setSendMethod("email");
      handleSend("email");
    } else if (hasPhone) {
      setSendMethod("sms");
      handleSend("sms");
    } else {
      toast.error("No valid email or phone number available");
    }
  };

  const handleMethodSelect = (method: "email" | "sms") => {
    setShowMethodDialog(false);
    setSendMethod(method);
    handleSend(method);
  };

  const handleSend = async (method?: "email" | "sms") => {
    const selectedMethod = method || sendMethod;
    const targetAddress = selectedMethod === "email" ? contactInfo.email : contactInfo.phone;

    if (!targetAddress?.trim()) {
      toast.error(`No ${selectedMethod === "email" ? "email address" : "phone number"} available`);
      return;
    }

    try {
      // Save document first if needed
      if (onSave) {
        const saveSuccess = await onSave();
        if (!saveSuccess) {
          toast.error("Failed to save document");
          return;
        }
      }

      const result = await sendDocument({
        sendMethod: selectedMethod,
        sendTo: targetAddress.trim(),
        documentNumber,
        documentDetails: { 
          [documentType + '_number']: documentNumber,
          total: total
        },
        lineItems: [],
        contactInfo,
        customNote: customNote.trim(),
        jobId: documentId,
        existingDocumentId: documentId
      });

      if (result.success) {
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully!`);
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error(`Error sending ${documentType}:`, error);
      toast.error(`Failed to send ${documentType}`);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      const success = await onDelete();
      if (success) {
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} deleted successfully`);
        onClose();
      }
    } catch (error) {
      console.error(`Error deleting ${documentType}:`, error);
      toast.error(`Failed to delete ${documentType}`);
    }
  };

  if (!isOpen) return null;

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {documentType} {documentNumber}? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Send className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold flex-1">
                Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} {documentNumber}
              </h3>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
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

            <div>
              <Label htmlFor="customNote">Custom Note (Optional)</Label>
              <Textarea
                id="customNote"
                placeholder="Add a personal note to include with the document..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="p-6 border-t flex gap-2">
            <Button
              onClick={handleSendClick}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Sending..." : `Send ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <SendMethodDialog
        isOpen={showMethodDialog}
        onClose={() => setShowMethodDialog(false)}
        onSelectMethod={handleMethodSelect}
        documentType={documentType}
        contactInfo={contactInfo}
      />
    </>
  );
};
