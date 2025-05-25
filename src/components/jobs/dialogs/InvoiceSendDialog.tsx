
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface InvoiceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  clientEmail?: string;
  clientPhone?: string;
  onSend: (recipient: string, method: 'email' | 'sms', message?: string) => Promise<boolean>;
}

export const InvoiceSendDialog = ({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  clientEmail,
  clientPhone,
  onSend
}: InvoiceSendDialogProps) => {
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Set default recipient when method changes
  useEffect(() => {
    if (method === 'email' && clientEmail) {
      setRecipient(clientEmail);
    } else if (method === 'sms' && clientPhone) {
      setRecipient(clientPhone);
    }
  }, [method, clientEmail, clientPhone]);

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error("Please enter a recipient");
      return;
    }

    setIsSending(true);
    
    try {
      const success = await onSend(recipient, method, customMessage);
      if (success) {
        onOpenChange(false);
        setCustomMessage('');
      }
    } finally {
      setIsSending(false);
    }
  };

  const defaultMessage = `Your invoice ${invoiceNumber} is ready for review. Please find the details below.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Invoice {invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Send Method</Label>
            <RadioGroup
              value={method}
              onValueChange={(value) => setMethod(value as 'email' | 'sms')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">
              {method === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={
                method === 'email' 
                  ? 'client@example.com' 
                  : '+1 (555) 123-4567'
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultMessage}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || !recipient.trim()}
            className="gap-2"
          >
            {isSending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send {method === 'email' ? 'Email' : 'SMS'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
