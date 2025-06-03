
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateNumber: string;
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onSave: () => Promise<boolean>;
}

const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const EstimateSendDialog = ({
  open,
  onOpenChange,
  estimateNumber,
  jobId,
  onSuccess,
  onCancel,
  onSave
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [estimateData, setEstimateData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"send" | "confirmation">("send");

  // Fetch client and estimate data
  useEffect(() => {
    if (open && jobId) {
      fetchClientAndEstimateData();
    }
  }, [open, jobId, estimateNumber]);

  const fetchClientAndEstimateData = async () => {
    try {
      // Get job and client info
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', jobId)
        .single();

      if (jobError) {
        console.error('Error fetching job:', jobError);
        return;
      }

      // Get estimate data
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .single();

      if (estimateError) {
        console.error('Error fetching estimate:', estimateError);
        return;
      }

      const clientData = Array.isArray(job.client) ? job.client[0] : job.client;
      setClientInfo(clientData);
      setEstimateData(estimate);

      // Auto-fill based on available contact info
      if (clientData?.email && isValidEmail(clientData.email)) {
        setSendMethod("email");
        setSendTo(clientData.email);
      } else if (clientData?.phone && isValidPhoneNumber(clientData.phone)) {
        setSendMethod("sms");
        setSendTo(formatPhoneForTelnyx(clientData.phone));
      }

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load client information');
    }
  };

  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    
    if (value === "email" && clientInfo?.email && isValidEmail(clientInfo.email)) {
      setSendTo(clientInfo.email);
    } else if (value === "sms" && clientInfo?.phone && isValidPhoneNumber(clientInfo.phone)) {
      setSendTo(formatPhoneForTelnyx(clientInfo.phone));
    } else {
      setSendTo("");
    }
  };

  const validateInput = (): string | null => {
    if (!sendTo.trim()) {
      return `Please enter a ${sendMethod === "email" ? "email address" : "phone number"}`;
    }

    if (sendMethod === "email" && !isValidEmail(sendTo)) {
      return "Please enter a valid email address";
    }

    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      return "Please enter a valid phone number";
    }

    return null;
  };

  const handleSend = async () => {
    const validationError = validateInput();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      // First save the estimate
      console.log('Saving estimate before sending...');
      const saveSuccess = await onSave();
      if (!saveSuccess) {
        toast.error("Failed to save estimate. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (sendMethod === "email") {
        // Use existing email function
        const { data, error } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId: estimateData.id,
            sendMethod: 'email',
            recipientEmail: sendTo,
            subject: customMessage ? `Estimate #${estimateNumber}` : undefined,
            message: customMessage || undefined
          }
        });

        if (error) throw error;

        if (data?.success) {
          toast.success("Estimate sent via email successfully!");
          setCurrentStep("confirmation");
        } else {
          throw new Error(data?.error || 'Failed to send email');
        }
      } else {
        // Use new SMS function
        const { data, error } = await supabase.functions.invoke('send-estimate-sms', {
          body: {
            estimateId: estimateData.id,
            recipientPhone: sendTo,
            customMessage: customMessage || undefined
          }
        });

        if (error) throw error;

        if (data?.success) {
          toast.success("Estimate sent via SMS successfully!");
          setCurrentStep("confirmation");
        } else {
          throw new Error(data?.error || 'Failed to send SMS');
        }
      }

    } catch (error: any) {
      console.error('Error sending estimate:', error);
      toast.error(`Failed to send estimate: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (currentStep === "confirmation") {
      onSuccess();
    } else {
      onCancel();
    }
  };

  const resetForm = () => {
    setCurrentStep("send");
    setCustomMessage("");
    setIsProcessing(false);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            {currentStep === "send" ? "Send Estimate" : "Estimate Sent"}
          </DialogTitle>
        </DialogHeader>

        {currentStep === "send" && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              Send estimate <span className="font-medium">#{estimateNumber}</span> to{' '}
              <span className="font-medium">{clientInfo?.name || 'client'}</span>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">How would you like to send?</Label>
              
              <RadioGroup value={sendMethod} onValueChange={handleSendMethodChange}>
                <Card className={`cursor-pointer transition-colors ${sendMethod === "email" ? "ring-2 ring-blue-500 bg-blue-50/30" : "hover:bg-gray-50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="email" id="email" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="email" className="flex items-center gap-2 font-medium cursor-pointer">
                          <Mail className="w-4 h-4 text-blue-600" />
                          Email
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Professional email with portal access link
                        </p>
                        {clientInfo?.email && (
                          <p className="text-xs text-blue-600 mt-1">{clientInfo.email}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-colors ${sendMethod === "sms" ? "ring-2 ring-blue-500 bg-blue-50/30" : "hover:bg-gray-50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="sms" id="sms" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="sms" className="flex items-center gap-2 font-medium cursor-pointer">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          Text Message
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Quick SMS with portal link
                        </p>
                        {clientInfo?.phone && (
                          <p className="text-xs text-green-600 mt-1">{clientInfo.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-to">
                {sendMethod === "email" ? "Email Address" : "Phone Number"}
              </Label>
              <Input
                id="send-to"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890"}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={sendMethod === "email" 
                  ? "Add a personal note to the email..." 
                  : "Add a custom SMS message..."
                }
                className="text-sm min-h-[80px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={!sendTo || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Sending..." : `Send via ${sendMethod === "email" ? "Email" : "SMS"}`}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "confirmation" && (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Estimate Sent Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              The estimate has been sent to the client via {sendMethod === "email" ? "email" : "text message"}.
              {sendMethod === "email" ? " They can access their portal to view and respond." : " They received a link to view the estimate."}
            </p>
            <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
