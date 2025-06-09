
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<boolean>;
  onAddWarranty: () => void;
  invoiceNumber: string;
  jobId: string;
}

export const InvoiceSendDialog = ({
  open,
  onOpenChange,
  onSave,
  onAddWarranty,
  invoiceNumber,
  jobId
}: InvoiceSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast({
        title: "Error",
        description: `Please enter a ${sendMethod === 'email' ? 'email address' : 'phone number'}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await onSave();
      if (success) {
        toast({
          title: "Success",
          description: `Invoice sent via ${sendMethod} successfully`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Invoice {invoiceNumber}</DialogTitle>
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
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder={`Add a personal message to include with the invoice...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : `Send via ${sendMethod === 'email' ? 'Email' : 'SMS'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
