
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface SendDialogProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  onSend: (data: SendData) => Promise<void>;
  onCancel: () => void;
}

interface SendData {
  sendMethod: "email" | "sms";
  sendTo: string;
  documentNumber: string;
  documentDetails: any;
  lineItems: any[];
  contactInfo: any;
  customNote: string;
  jobId?: string;
  onSave?: () => void;
  existingDocumentId?: string;
}

export const SendDialog = ({ 
  documentType, 
  documentNumber, 
  clientName, 
  clientEmail = "", 
  clientPhone = "", 
  onSend, 
  onCancel 
}: SendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState(clientEmail || clientPhone || "");
  const [customNote, setCustomNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!sendTo.trim()) {
      toast.error(`Please enter ${sendMethod === "email" ? "email address" : "phone number"}`);
      return;
    }

    setIsLoading(true);
    try {
      await onSend({
        sendMethod,
        sendTo: sendTo.trim(),
        documentNumber,
        documentDetails: {}, // Will be filled by parent component
        lineItems: [], // Will be filled by parent component
        contactInfo: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone
        },
        customNote: customNote.trim()
      });
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully!`);
    } catch (error) {
      console.error(`Error sending ${documentType}:`, error);
      toast.error(`Failed to send ${documentType}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Send className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">
          Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} {documentNumber}
        </h3>
      </div>

      <div className="space-y-4">
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

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSend}
          disabled={isLoading || !sendTo.trim()}
          className="flex-1"
        >
          {isLoading ? "Sending..." : `Send ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
