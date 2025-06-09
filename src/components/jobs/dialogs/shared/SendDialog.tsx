
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentNumber: string;
  documentType: 'estimate' | 'invoice';
  total: number;
  contactInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  onSuccess: () => void;
  onSave: () => Promise<boolean>;
  useSendingHook: any;
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
  const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const { sendDocument, isProcessing } = useSendingHook({
    documentId,
    documentNumber,
    documentType,
    total,
    contactInfo,
    onSuccess
  });

  React.useEffect(() => {
    if (isOpen) {
      setRecipient(sendMethod === 'email' ? (contactInfo.email || '') : (contactInfo.phone || ''));
      setMessage(`Hi ${contactInfo.name}, your ${documentType} is ready for review.`);
    }
  }, [isOpen, sendMethod, contactInfo, documentType]);

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast({
        title: "Error",
        description: `Please enter a ${sendMethod === 'email' ? 'email address' : 'phone number'}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const saveSuccess = await onSave();
      if (!saveSuccess) {
        toast({
          title: "Error",
          description: "Failed to save document",
          variant: "destructive",
        });
        return;
      }

      const result = await sendDocument(sendMethod, recipient, message);
      if (result.success) {
        toast({
          title: "Success",
          description: `${documentType} sent successfully via ${sendMethod}`,
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send document",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send {documentType} {documentNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Send Method Toggle */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Mail className={`h-4 w-4 ${sendMethod === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={sendMethod === 'email' ? 'font-medium' : 'text-muted-foreground'}>Email</span>
            </div>
            <Switch
              checked={sendMethod === 'sms'}
              onCheckedChange={(checked) => setSendMethod(checked ? 'sms' : 'email')}
            />
            <div className="flex items-center space-x-2">
              <MessageSquare className={`h-4 w-4 ${sendMethod === 'sms' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={sendMethod === 'sms' ? 'font-medium' : 'text-muted-foreground'}>SMS</span>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">
              {sendMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="recipient"
              type={sendMethod === 'email' ? 'email' : 'tel'}
              placeholder={sendMethod === 'email' ? 'client@example.com' : '+1 (555) 123-4567'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isProcessing}>
              <Send className="h-4 w-4 mr-2" />
              {isProcessing ? 'Sending...' : `Send via ${sendMethod === 'email' ? 'Email' : 'SMS'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
