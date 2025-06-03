
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateNumber: string;
  estimateDetails?: any;
  lineItems?: any[];
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  jobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSave: () => Promise<boolean>;
}

export const EstimateSendDialog = ({ 
  open, 
  onOpenChange, 
  estimateNumber,
  estimateDetails,
  lineItems,
  contactInfo,
  clientInfo,
  jobId,
  onSuccess,
  onCancel,
  onSave
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientData, setClientData] = useState<any>(null);

  // Use clientInfo or contactInfo, whichever is available
  const finalContactInfo = clientInfo || contactInfo || { name: '', email: '', phone: '' };

  // Fetch client data when dialog opens
  useEffect(() => {
    const fetchClientData = async () => {
      if (open && jobId) {
        console.log("Fetching client data for job:", jobId);
        try {
          const { data: job, error } = await supabase
            .from('jobs')
            .select(`
              *,
              clients:client_id (*)
            `)
            .eq('id', jobId)
            .single();

          if (!error && job?.clients) {
            const client = Array.isArray(job.clients) ? job.clients[0] : job.clients;
            setClientData(client);
            console.log("Client data loaded:", client);
          }
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      }
    };

    fetchClientData();
  }, [open, jobId]);

  // Set default recipient when dialog opens or send method changes
  useEffect(() => {
    if (open && (clientData || finalContactInfo)) {
      const contact = clientData || finalContactInfo;
      setSendTo(sendMethod === "email" ? (contact.email || "") : (contact.phone || ""));
    }
  }, [open, sendMethod, clientData, finalContactInfo]);

  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    const contact = clientData || finalContactInfo;
    if (contact) {
      setSendTo(value === "email" ? (contact.email || "") : (contact.phone || ""));
    }
  };

  const handleSend = async () => {
    console.log("=== SEND ESTIMATE CLICKED ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Estimate number:", estimateNumber);

    if (!sendTo.trim()) {
      toast.error("Please enter a recipient");
      return;
    }

    // Validate email/phone
    if (sendMethod === "email" && !sendTo.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);

    try {
      // Get the estimate from database
      const { data: estimate, error: fetchError } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, status, notes, job_id')
        .eq('estimate_number', estimateNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !estimate) {
        console.error("Failed to fetch estimate:", fetchError);
        toast.error("Estimate not found. Please save the estimate first.");
        return;
      }

      console.log("Retrieved estimate:", estimate);
      const contact = clientData || finalContactInfo;

      // Send via appropriate method
      if (sendMethod === "sms") {
        // Format phone number for Telnyx
        const formattedPhone = formatPhoneForTelnyx(sendTo);
        console.log("Sending SMS to:", formattedPhone);
        
        const smsMessage = customNote || `Hi ${contact.name}! Your estimate ${estimateNumber} is ready. Total: $${estimate.total.toFixed(2)}. Please contact us if you have any questions.`;
        
        const { data: smsData, error: smsError } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: formattedPhone,
            body: smsMessage,
            client_id: jobId || null,
            job_id: jobId || null
          }
        });

        if (smsError || !smsData?.success) {
          console.error("SMS sending failed:", smsError || smsData);
          toast.error(`Failed to send SMS: ${smsError?.message || smsData?.error || 'Unknown error'}`);
          return;
        }

        console.log("SMS sent successfully:", smsData);
        toast.success(`Estimate ${estimateNumber} sent via SMS to ${contact.name}`);
      } else {
        // Send via email
        console.log("Sending email to:", sendTo);
        
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId: estimate.id,
            sendMethod: 'email',
            recipientEmail: sendTo,
            subject: `Estimate ${estimateNumber} from your service provider`,
            message: customNote || `Please find your estimate ${estimateNumber}. Total: $${estimate.total.toFixed(2)}.`
          }
        });
        
        if (emailError || !emailData?.success) {
          console.error("Email sending failed:", emailError || emailData);
          toast.error(`Failed to send email: ${emailError?.message || emailData?.error || 'Unknown error'}`);
          return;
        }

        console.log("Email sent successfully:", emailData);
        toast.success(`Estimate ${estimateNumber} sent via email to ${contact.name}`);
      }

      // Update estimate status to 'sent'
      await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', estimate.id);

      console.log("Estimate status updated to 'sent'");

      // Close dialog and call success callback
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error("CRITICAL ERROR in send estimate process:", error);
      toast.error(`An error occurred while sending the estimate: ${error.message}`);
    } finally {
      setIsProcessing(false);
      console.log("=== ESTIMATE SEND PROCESS COMPLETED ===");
    }
  };

  const handleCancel = () => {
    console.log("Send cancelled");
    onOpenChange(false);
    if (onCancel) {
      onCancel();
    }
  };

  const contact = clientData || finalContactInfo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Estimate {estimateNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Send Method</Label>
            <RadioGroup 
              value={sendMethod} 
              onValueChange={handleSendMethodChange}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="sendTo">
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="sendTo"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890"}
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="customNote">Custom Message (Optional)</Label>
            <Textarea
              id="customNote"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Add a personal message to your estimate..."
              rows={3}
              disabled={isProcessing}
            />
          </div>

          {/* Client Info Display */}
          {contact && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Sending to:</h4>
              <div className="text-sm text-gray-600">
                <p><strong>{contact.name || 'Unknown Client'}</strong></p>
                <p>Email: {contact.email || 'Not provided'}</p>
                <p>Phone: {contact.phone || 'Not provided'}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isProcessing || !sendTo.trim()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              `Send via ${sendMethod === "email" ? "Email" : "SMS"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
