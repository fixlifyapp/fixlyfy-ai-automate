
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendTestSms } from "@/services/edgeSmsService";

interface SmsTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SmsTestDialog = ({ open, onOpenChange }: SmsTestDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState("+34605180392");
  const [message, setMessage] = useState("Hello, world!");
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!phoneNumber || !message) {
      toast.error("Please enter both phone number and message");
      return;
    }

    setIsSending(true);

    try {
      await sendTestSms(phoneNumber, message);
      toast.success("Test SMS sent successfully!");
      
      // Don't close the dialog so they can send more test messages if needed
    } catch (error) {
      console.error("Failed to send test SMS:", error);
      toast.error("Failed to send test SMS. Check console for details.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Test SMS Notifications</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +34 for Spain)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter test message"
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendTest} 
            disabled={isSending || !phoneNumber || !message}
          >
            {isSending ? "Sending..." : "Send Test SMS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
