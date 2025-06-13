
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, FileText, Send, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { LineItem } from "../../builder/types";

interface SendDocumentStepProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  jobData: any;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  total: number;
  onSave: () => Promise<boolean>;
  onBack: () => void;
  onSuccess: () => void;
}

export const SendDocumentStep = ({
  documentType,
  documentNumber,
  jobData,
  lineItems,
  taxRate,
  notes,
  total,
  onSave,
  onBack,
  onSuccess
}: SendDocumentStepProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Mock client data
  const clientInfo = {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567"
  };

  const handleSend = async () => {
    if (!recipientEmail && sendMethod === "email") {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!recipientPhone && sendMethod === "sms") {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSending(true);

    try {
      // First save the document
      const saved = await onSave();
      if (!saved) {
        toast.error("Failed to save document");
        return;
      }

      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      const recipient = sendMethod === "email" ? recipientEmail : recipientPhone;
      const method = sendMethod === "email" ? "email" : "SMS";

      toast.success(`${documentType} sent via ${method} to ${recipient}`);
      onSuccess();
    } catch (error) {
      console.error("Error sending document:", error);
      toast.error("Failed to send document");
    } finally {
      setIsSending(false);
    }
  };

  const defaultMessage = `Hi ${clientInfo.name}! Your ${documentType} ${documentNumber} is ready. Total: $${total.toFixed(2)}. Please review and let us know if you have any questions.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Send {documentType}</h2>
        <p className="text-muted-foreground">
          Choose how to deliver your {documentType} to the client
        </p>
      </div>

      {/* Document Summary */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{documentType} {documentNumber}</h3>
            <p className="text-muted-foreground">Ready to send to client</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{lineItems.length} items</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{clientInfo.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Job</p>
              <p className="font-medium">{jobData.title}</p>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Send Method Selection */}
      <ModernCard className="p-6">
        <h3 className="font-semibold mb-4">Delivery Method</h3>
        
        <RadioGroup value={sendMethod} onValueChange={(value) => setSendMethod(value as "email" | "sms")}>
          <div className="grid grid-cols-2 gap-4">
            <Label htmlFor="email" className="cursor-pointer">
              <div className={`p-4 border rounded-lg transition-colors ${sendMethod === "email" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="email" id="email" />
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send via email with PDF attachment
                </p>
              </div>
            </Label>

            <Label htmlFor="sms" className="cursor-pointer">
              <div className={`p-4 border rounded-lg transition-colors ${sendMethod === "sms" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="sms" id="sms" />
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">SMS</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send via text message with link
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </ModernCard>

      {/* Recipient Information */}
      <ModernCard className="p-6">
        <h3 className="font-semibold mb-4">Recipient Information</h3>
        
        {sendMethod === "email" ? (
          <div className="space-y-3">
            <Label htmlFor="recipient-email">Email Address</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="Enter client email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setRecipientEmail(clientInfo.email)}
              className="text-xs"
            >
              Use: {clientInfo.email}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="recipient-phone">Phone Number</Label>
            <Input
              id="recipient-phone"
              type="tel"
              placeholder="Enter client phone number"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setRecipientPhone(clientInfo.phone)}
              className="text-xs"
            >
              Use: {clientInfo.phone}
            </Button>
          </div>
        )}
      </ModernCard>

      {/* Custom Message */}
      <ModernCard className="p-6">
        <h3 className="font-semibold mb-4">Message</h3>
        <Textarea
          placeholder="Add a personal message..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={4}
        />
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCustomMessage(defaultMessage)}
            className="text-xs"
          >
            Use default message
          </Button>
        </div>
      </ModernCard>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button 
          onClick={handleSend}
          disabled={isSending}
          className="gap-2 min-w-32"
        >
          {isSending ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send {documentType}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
