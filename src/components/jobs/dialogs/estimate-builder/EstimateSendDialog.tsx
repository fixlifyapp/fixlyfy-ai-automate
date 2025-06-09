
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: {
    id: string;
    estimate_number: string;
    total: number;
  };
  clientInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  onSendSuccess: () => void;
}

export const EstimateSendDialog = ({
  open,
  onOpenChange,
  estimate,
  clientInfo,
  onSendSuccess
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = React.useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setRecipient(sendMethod === 'email' ? (clientInfo.email || '') : (clientInfo.phone || ''));
      setMessage(`Hi ${clientInfo.name}, your estimate ${estimate.estimate_number} is ready for review.`);
    }
  }, [open, sendMethod, clientInfo, estimate.estimate_number]);

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
      // Mock sending functionality
      console.log('Sending estimate:', {
        estimateId: estimate.id,
        estimateNumber: estimate.estimate_number,
        method: sendMethod,
        recipient,
        message,
        total: estimate.total,
        clientInfo
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: `Estimate sent successfully via ${sendMethod}`,
      });
      
      onSendSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send estimate",
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
          <DialogTitle>Send Estimate {estimate.estimate_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Send Method Toggle */}
          <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
            <Button
              variant={sendMethod === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSendMethod('email')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant={sendMethod === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSendMethod('sms')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </Button>
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
