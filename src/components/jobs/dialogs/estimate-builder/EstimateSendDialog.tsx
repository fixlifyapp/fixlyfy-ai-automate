
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageSquare, Loader2, AlertCircle, CheckCircle } from "lucide-react";
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
  const [configError, setConfigError] = useState<string>("");

  // Use clientInfo or contactInfo, whichever is available
  const finalContactInfo = clientInfo || contactInfo || { name: '', email: '', phone: '' };

  // Check configuration when dialog opens
  useEffect(() => {
    const checkConfiguration = async () => {
      if (open) {
        try {
          // Check if required secrets are configured
          const { data: companySettings } = await supabase
            .from('company_settings')
            .select('mailgun_api_key, company_phone, mailgun_domain, email_from_address')
            .limit(1)
            .maybeSingle();

          console.log('Company settings check:', companySettings);

          if (sendMethod === 'email') {
            if (!companySettings?.mailgun_domain || !companySettings?.email_from_address) {
              setConfigError('Email not configured. Please set up Mailgun domain and email address in company settings.');
            } else {
              setConfigError('');
            }
          } else if (sendMethod === 'sms') {
            if (!companySettings?.company_phone) {
              setConfigError('SMS not configured. Please set up company phone number in settings.');
            } else {
              setConfigError('');
            }
          }
        } catch (error) {
          console.error('Configuration check error:', error);
          setConfigError('Unable to check configuration. Please try again.');
        }
      }
    };

    checkConfiguration();
  }, [open, sendMethod]);

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

    if (configError) {
      toast.error(`Configuration Error: ${configError}`);
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

      // Send via appropriate method using the updated edge function
      const { data: sendData, error: sendError } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: estimate.id,
          sendMethod: sendMethod,
          recipientEmail: sendMethod === 'email' ? sendTo : undefined,
          recipientPhone: sendMethod === 'sms' ? sendTo : undefined,
          subject: sendMethod === 'email' ? `Estimate ${estimateNumber} from ${contact?.name || 'your service provider'}` : undefined,
          message: customNote || (sendMethod === 'email' 
            ? `Please find your estimate ${estimateNumber}. Total: $${estimate.total?.toFixed(2) || '0.00'}.` 
            : `Hi ${contact?.name || 'Customer'}! Your estimate ${estimateNumber} is ready. Total: $${estimate.total?.toFixed(2) || '0.00'}. Please contact us if you have any questions.`)
        }
      });
      
      if (sendError || !sendData?.success) {
        console.error("Send operation failed:", sendError || sendData);
        const errorMessage = sendError?.message || sendData?.error || 'Unknown error occurred';
        
        // Provide specific error messages for common issues
        if (errorMessage.includes('Mailgun API key not configured')) {
          toast.error('Email sending not configured. Please contact support to set up Mailgun.');
        } else if (errorMessage.includes('Telnyx API key not configured')) {
          toast.error('SMS sending not configured. Please contact support to set up Telnyx.');
        } else if (errorMessage.includes('Company phone number not configured')) {
          toast.error('Company phone number not set up. Please configure it in settings.');
        } else {
          toast.error(`Failed to send ${sendMethod}: ${errorMessage}`);
        }
        return;
      }

      console.log("Send operation successful:", sendData);
      toast.success(`Estimate ${estimateNumber} sent successfully via ${sendMethod}!`);

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

          {configError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{configError}</AlertDescription>
            </Alert>
          )}

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
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sending to:
              </h4>
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
            disabled={isProcessing || !sendTo.trim() || !!configError}
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
