
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface EstimateSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  estimateNumber: string;
  total: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const EstimateSendDialog = ({ 
  isOpen, 
  onClose, 
  estimateId, 
  estimateNumber, 
  total,
  contactInfo 
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [recipientEmail, setRecipientEmail] = useState(contactInfo?.email || "");
  const [recipientPhone, setRecipientPhone] = useState(contactInfo?.phone || "");
  const [subject, setSubject] = useState(`Estimate #${estimateNumber}`);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch user's Telnyx phone numbers
  const { data: userPhoneNumbers = [] } = useQuery({
    queryKey: ['user-telnyx-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'active')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleSend = async () => {
    if (sendMethod === "email" && !recipientEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (sendMethod === "sms" && !recipientPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    if (sendMethod === "sms" && userPhoneNumbers.length === 0) {
      toast.error("No Telnyx phone numbers available. Please purchase a phone number first.");
      return;
    }

    setIsSending(true);

    try {
      if (sendMethod === "email") {
        const { data, error } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId,
            sendMethod: "email",
            recipientEmail,
            subject,
            message
          }
        });

        if (error) throw error;
        toast.success("Estimate sent via email successfully!");
      } else {
        // Use the first available Telnyx phone number
        const fromNumber = userPhoneNumbers[0]?.phone_number;
        
        const { data, error } = await supabase.functions.invoke('send-estimate-sms', {
          body: {
            estimateId,
            recipientPhone,
            fromNumber,
            message: message || `Hi ${contactInfo?.name || 'Customer'}! Your estimate #${estimateNumber} is ready. Total: $${total.toFixed(2)}. Please contact us if you have any questions.`
          }
        });

        if (error) throw error;
        toast.success("Estimate sent via SMS successfully!");
      }
      
      onClose();
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Send Estimate #{estimateNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            {contactInfo?.name && (
              <p className="text-sm text-blue-800">
                <strong>Customer:</strong> {contactInfo.name}
              </p>
            )}
          </div>

          <Tabs value={sendMethod} onValueChange={(value) => setSendMethod(value as "email" | "sms")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              {userPhoneNumbers.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    No Telnyx phone numbers available. Please purchase a phone number first.
                  </span>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>From:</strong> {userPhoneNumbers[0]?.phone_number}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sms-message">Message (Optional)</Label>
                    <Textarea
                      id="sms-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Hi ${contactInfo?.name || 'Customer'}! Your estimate #${estimateNumber} is ready. Total: $${total.toFixed(2)}. Please contact us if you have any questions.`}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSending || (sendMethod === "sms" && userPhoneNumbers.length === 0)}
            >
              {isSending ? "Sending..." : `Send via ${sendMethod === "email" ? "Email" : "SMS"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
