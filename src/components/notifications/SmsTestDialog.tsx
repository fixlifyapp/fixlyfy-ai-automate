
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
import { sendTestSms, sendWelcomeMessage } from "@/services/edgeSmsService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface SmsTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SmsTestDialog = ({ open, onOpenChange }: SmsTestDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState("+16475289485");
  const [message, setMessage] = useState("Hello, world!");
  const [messageType, setMessageType] = useState("test");
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!phoneNumber || !message) {
      toast.error("Please enter both phone number and message");
      return;
    }

    setIsSending(true);

    try {
      if (messageType === "test") {
        await sendTestSms(phoneNumber, message);
        toast.success("Test SMS sent successfully!");
      } else if (messageType === "welcome") {
        await sendWelcomeMessage(phoneNumber, message);
        toast.success("Welcome SMS sent successfully!");
      }
      
      // Don't close the dialog so they can send more test messages if needed
    } catch (error) {
      console.error("Failed to send SMS:", error);
      toast.error("Failed to send SMS. Check console for details.");
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
            <Label htmlFor="messageType">Message Type</Label>
            <Select
              value={messageType}
              onValueChange={setMessageType}
            >
              <SelectTrigger id="messageType">
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test SMS</SelectItem>
                <SelectItem value="welcome">Welcome Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US/Canada)
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
            {isSending ? "Sending..." : "Send SMS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
