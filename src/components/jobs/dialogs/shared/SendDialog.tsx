
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
  useSendingHook: () => {
    sendDocument: (data: any) => Promise<{ success: boolean }>;
    isProcessing: boolean;
  };
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
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState(contactInfo?.email || contactInfo?.phone || "");
  const [customNote, setCustomNote] = useState("");
  const { sendDocument, isProcessing } = useSendingHook();

  const handleSend = async () => {
    if (!sendTo.trim()) {
      toast.error(`Please enter ${sendMethod === "email" ? "email address" : "phone number"}`);
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
        sendMethod,
        sendTo: sendTo.trim(),
        documentNumber,
        documentDetails: { [documentType + '_number']: documentNumber },
        lineItems: [], // Will be filled by parent component
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

  const handleBack = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Send className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} {documentNumber}
            </h3>
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
            <Label htmlFor="sendMethod">Send Method</Label>
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

          <div>
            <Label htmlFor="sendTo">
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="sendTo"
              type={sendMethod === "email" ? "email" : "tel"}
              placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890"}
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
            />
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
            onClick={handleSend}
            disabled={isProcessing || !sendTo.trim()}
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
  );
};
