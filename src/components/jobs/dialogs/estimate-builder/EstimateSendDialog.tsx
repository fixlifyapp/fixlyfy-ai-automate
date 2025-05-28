import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WarrantySelectionStep } from "./WarrantySelectionStep";
import { Product } from "../../builder/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<boolean>;
  onAddWarranty: (warranty: Product | null, note: string) => void;
  clientInfo?: { 
    id?: string;
    name?: string;
    email?: string; 
    phone?: string; 
  } | null;
  estimateNumber: string;
  jobId?: string;
}

interface EstimateDetails {
  estimate_id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  job_title: string;
  job_description?: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

type SendStep = "warranty" | "send-method" | "confirmation";

// Utility function to format phone number for Twilio
const formatPhoneForTwilio = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  console.warn("Invalid phone number format:", phoneNumber);
  return phoneNumber;
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10;
};

const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const EstimateSendDialog = ({
  open,
  onOpenChange,
  onSave,
  onAddWarranty,
  clientInfo: propClientInfo,
  estimateNumber,
  jobId
}: EstimateSendDialogProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SendStep>("warranty");
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [estimateDetails, setEstimateDetails] = useState<EstimateDetails | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [clientInfo, setClientInfo] = useState(propClientInfo);
  
  // Fetch job and client details when dialog opens
  useEffect(() => {
    if (open && estimateNumber) {
      console.log("Dialog opened, fetching data for:", estimateNumber);
      fetchEstimateAndClientDetails();
    }
  }, [open, estimateNumber, jobId]);

  const fetchEstimateAndClientDetails = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching estimate details for estimate number:", estimateNumber);
      
      const { data: details, error: detailsError } = await supabase
        .from('estimate_details_view')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .maybeSingle();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Error fetching estimate details:', detailsError);
      }

      console.log("Estimate details from view:", details);

      if (details) {
        setEstimateDetails(details);
        setClientInfo({
          id: details.client_id,
          name: details.client_name,
          email: details.client_email,
          phone: details.client_phone
        });
        console.log("Client info updated from estimate details:", {
          id: details.client_id,
          name: details.client_name,
          email: details.client_email,
          phone: details.client_phone
        });
      } else {
        console.log("No data from view, trying direct fetch");
        
        const { data: estimate, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('estimate_number', estimateNumber)
          .maybeSingle();

        if (estimateError) {
          console.error('Error fetching estimate directly:', estimateError);
        }

        if (jobId || estimate?.job_id) {
          const targetJobId = jobId || estimate?.job_id;
          
          const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select(`
              *,
              client:clients(*)
            `)
            .eq('id', targetJobId)
            .single();

          if (!jobError && job?.client) {
            const clientData = Array.isArray(job.client) ? job.client[0] : job.client;
            
            setClientInfo({
              id: clientData.id,
              name: clientData.name,
              email: clientData.email,
              phone: clientData.phone
            });
            
            console.log("Client info fetched from job:", clientData);
          }
        }

        if (estimate) {
          const fallbackDetails: EstimateDetails = {
            estimate_id: estimate.id,
            estimate_number: estimate.estimate_number,
            total: estimate.total || 0,
            status: estimate.status || 'draft',
            notes: estimate.notes,
            job_id: estimate.job_id || '',
            job_title: '',
            job_description: '',
            client_id: clientInfo?.id || '',
            client_name: clientInfo?.name || 'Unknown Client',
            client_email: clientInfo?.email,
            client_phone: clientInfo?.phone,
            client_company: ''
          };

          setEstimateDetails(fallbackDetails);
          console.log("Using fallback estimate details:", fallbackDetails);
        }
      }

      const estimateId = details?.estimate_id || estimateDetails?.estimate_id;
      if (estimateId) {
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'estimate')
          .eq('parent_id', estimateId);

        if (itemsError) {
          console.error('Error fetching line items:', itemsError);
        } else if (items) {
          console.log("Line items loaded:", items.length, "items");
          setLineItems(items);
        }
      }

    } catch (error: any) {
      console.error('Error in fetchEstimateAndClientDetails:', error);
      toast.error('Failed to load estimate data');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientContactInfo = () => {
    const contactData = {
      name: clientInfo?.name || estimateDetails?.client_name || 'Unknown Client',
      email: clientInfo?.email || estimateDetails?.client_email || '',
      phone: clientInfo?.phone || estimateDetails?.client_phone || ''
    };
    
    console.log("Final contact data:", contactData);
    return contactData;
  };

  const contactInfo = getClientContactInfo();
  const hasValidEmail = isValidEmail(contactInfo.email);
  const hasValidPhone = isValidPhoneNumber(contactInfo.phone);
  
  console.log("Contact validation - Email valid:", hasValidEmail, "Phone valid:", hasValidPhone);
  console.log("Contact info:", contactInfo);

  useEffect(() => {
    if (contactInfo.name !== 'Unknown Client') {
      setValidationError("");
      
      if (hasValidEmail && sendMethod === "email") {
        setSendTo(contactInfo.email);
      } else if (hasValidPhone && sendMethod === "sms") {
        const formattedPhone = formatPhoneForTwilio(contactInfo.phone);
        setSendTo(formattedPhone);
        console.log("Auto-filled phone number:", formattedPhone);
      } else if (hasValidEmail && !hasValidPhone) {
        setSendMethod("email");
        setSendTo(contactInfo.email);
      } else if (hasValidPhone && !hasValidEmail) {
        setSendMethod("sms");
        const formattedPhone = formatPhoneForTwilio(contactInfo.phone);
        setSendTo(formattedPhone);
      }
    }
  }, [contactInfo, sendMethod, hasValidEmail, hasValidPhone]);

  const getEstimateId = (): string | null => {
    if (estimateDetails && 'estimate_id' in estimateDetails) {
      return estimateDetails.estimate_id;
    }
    return null;
  };

  const getEstimateTotal = (): number => {
    if (estimateDetails && 'total' in estimateDetails) {
      return estimateDetails.total;
    }
    return 0;
  };

  const getEstimateNotes = (): string | undefined => {
    if (estimateDetails && 'notes' in estimateDetails) {
      return estimateDetails.notes;
    }
    return undefined;
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      console.log("Dialog opening, resetting state");
      setCurrentStep("warranty");
      setIsProcessing(false);
      setCustomNote("");
      setValidationError("");
    } else {
      console.log("Dialog closing, clearing data");
      setEstimateDetails(null);
      setLineItems([]);
      setSendTo("");
      setValidationError("");
    }
    onOpenChange(newOpen);
  };
  
  const handleWarrantySelect = (warranty: Product | null, note: string) => {
    console.log("Warranty selected:", warranty?.name || "none", "with note:", note);
    
    if (warranty) {
      onAddWarranty(warranty, note);
      setCustomNote(note);
    }
    
    console.log("Moving to send-method step");
    setCurrentStep("send-method");
  };
  
  const handleSkipWarranty = () => {
    console.log("Skipping warranty, moving to send-method step");
    setCurrentStep("send-method");
  };

  const handleSendMethodChange = (value: "email" | "sms") => {
    console.log("Send method changed to:", value);
    setSendMethod(value);
    setValidationError("");
    
    if (value === "email" && hasValidEmail) {
      setSendTo(contactInfo.email);
    } else if (value === "sms" && hasValidPhone) {
      const formattedPhone = formatPhoneForTwilio(contactInfo.phone);
      setSendTo(formattedPhone);
    } else {
      setSendTo("");
    }
  };

  const validateRecipient = (method: "email" | "sms", recipient: string): string | null => {
    if (!recipient.trim()) {
      return `Please enter a ${method === "email" ? "email address" : "phone number"}`;
    }

    if (method === "email") {
      if (!isValidEmail(recipient)) {
        return "Please enter a valid email address";
      }
    } else if (method === "sms") {
      if (!isValidPhoneNumber(recipient)) {
        return "Please enter a valid phone number";
      }
    }

    return null;
  };
  
  const handleSendEstimate = async () => {
    console.log("=== STARTING ESTIMATE SEND PROCESS ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Estimate number:", estimateNumber);
    console.log("Client info:", contactInfo);

    const validationErrorMsg = validateRecipient(sendMethod, sendTo);
    if (validationErrorMsg) {
      setValidationError(validationErrorMsg);
      toast.error(validationErrorMsg);
      console.error("Validation failed:", validationErrorMsg);
      return;
    }

    setIsProcessing(true);
    setValidationError("");
    
    try {
      console.log("Step 1: Saving estimate...");
      const success = await onSave();
      
      if (!success) {
        console.error("Failed to save estimate");
        toast.error("Failed to save estimate. Please try again.");
        setIsProcessing(false);
        return;
      }

      console.log("Step 2: Estimate saved, fetching updated details...");
      await fetchEstimateAndClientDetails();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const estimateId = getEstimateId();
      const estimateTotal = getEstimateTotal();
      const estimateNotes = getEstimateNotes();

      console.log("Step 3: Estimate details retrieved:", {
        estimateId,
        estimateTotal,
        estimateNotes
      });

      if (!estimateId) {
        console.error("No estimate ID found");
        toast.error("Estimate not found. Please save the estimate first and try again.");
        setIsProcessing(false);
        return;
      }

      let finalRecipient = sendTo;
      if (sendMethod === "sms") {
        finalRecipient = formatPhoneForTwilio(sendTo);
        console.log("Formatted phone number:", finalRecipient);
        
        if (!isValidPhoneNumber(finalRecipient)) {
          const error = "Invalid phone number format";
          setValidationError(error);
          toast.error(error);
          console.error(error);
          setIsProcessing(false);
          return;
        }
      }

      console.log("Step 4: Creating communication record...");
      const { data: commData, error: commError } = await supabase
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: sendMethod,
          recipient: finalRecipient,
          subject: sendMethod === 'email' ? `Estimate ${estimateNumber}` : null,
          content: sendMethod === 'sms' 
            ? `Hi ${contactInfo.name}! Your estimate ${estimateNumber} is ready. Total: $${estimateTotal.toFixed(2)}.`
            : `Please find your estimate ${estimateNumber} attached. Total: $${estimateTotal.toFixed(2)}.`,
          status: 'pending',
          estimate_number: estimateNumber,
          client_name: contactInfo.name,
          client_email: contactInfo.email,
          client_phone: contactInfo.phone
        })
        .select()
        .single();

      if (commError) {
        console.error('Error creating communication record:', commError);
        toast.error('Failed to create communication record');
        setIsProcessing(false);
        return;
      }

      console.log("Step 5: Communication record created:", commData);

      // Generate client portal login token
      let portalLoginLink = '';
      if (contactInfo.email) {
        try {
          console.log("Step 6: Generating portal login token...");
          const { data: tokenData, error: tokenError } = await supabase.rpc('generate_client_login_token', {
            p_email: contactInfo.email
          });

          if (!tokenError && tokenData) {
            portalLoginLink = `${window.location.origin}/portal/login?token=${tokenData}`;
            console.log("Portal login link generated");
          } else {
            console.warn("Failed to generate portal login token:", tokenError);
          }
        } catch (error) {
          console.error('Error generating portal login token:', error);
        }
      }

      const estimateData = {
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          taxable: item.taxable,
          total: item.quantity * Number(item.unit_price)
        })),
        total: estimateTotal,
        taxRate: 13,
        notes: customNote || estimateNotes,
        viewUrl: `${window.location.origin}/estimate/view/${estimateNumber}`,
        portalLoginLink: portalLoginLink
      };

      console.log("Step 7: Calling send-estimate edge function...");
      console.log("Request payload:", {
        method: sendMethod,
        recipient: finalRecipient,
        estimateNumber: estimateNumber,
        estimateData: estimateData,
        clientName: contactInfo.name,
        communicationId: commData.id
      });

      const { data, error } = await supabase.functions.invoke('send-estimate', {
        body: {
          method: sendMethod,
          recipient: finalRecipient,
          estimateNumber: estimateNumber,
          estimateData: estimateData,
          clientName: contactInfo.name,
          communicationId: commData.id
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message);
      }
      
      console.log("Step 8: Edge function response:", data);
      
      if (data?.success) {
        const method = sendMethod === "email" ? "email" : "text message";
        toast.success(`Estimate ${estimateNumber} sent to client via ${method}`);
        console.log("SUCCESS: Estimate sent successfully");
        
        if (estimateDetails?.client_id) {
          await supabase
            .from('client_notifications')
            .insert({
              client_id: estimateDetails.client_id,
              type: 'estimate_sent',
              title: 'New Estimate Available',
              message: `Estimate ${estimateNumber} has been sent to you. Total: $${estimateTotal.toFixed(2)}`,
              data: { 
                estimate_id: estimateId, 
                estimate_number: estimateNumber,
                portal_link: portalLoginLink 
              }
            });
        }

        // Update estimate status to 'sent'
        await supabase
          .from('estimates')
          .update({ status: 'sent' })
          .eq('id', estimateId);
        
        // Close dialog and trigger refresh
        onOpenChange(false);
        
        // Navigate back to job details with estimates tab active
        const currentPath = window.location.pathname;
        if (currentPath.includes('/jobs/')) {
          const jobId = currentPath.split('/').pop();
          navigate(`/jobs/${jobId}`, { state: { activeTab: "estimates" }, replace: true });
        }
        
      } else {
        console.error("Edge function returned error:", data);
        await supabase
          .from('estimate_communications')
          .update({
            status: 'failed',
            error_message: data?.error || 'Unknown error'
          })
          .eq('id', commData.id);
        
        toast.error(`Failed to send estimate: ${data?.error || 'Unknown error'}`);
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("CRITICAL ERROR in send estimate process:", error);
      toast.error(`An error occurred while sending the estimate: ${error.message}`);
      setIsProcessing(false);
    }
    
    console.log("=== ESTIMATE SEND PROCESS COMPLETED ===");
  };
  
  const handleCloseAfterSend = () => {
    onOpenChange(false);
    const currentPath = window.location.pathname;
    if (currentPath.includes('/jobs/')) {
      const jobId = currentPath.split('/').pop();
      const jobDetailsUrl = `/jobs/${jobId}`;
      navigate(jobDetailsUrl, { state: { activeTab: "estimates" } });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Estimate Details...</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "warranty" && "Add Warranty to Estimate"}
            {currentStep === "send-method" && "Send Estimate to Client"}
            {currentStep === "confirmation" && "Estimate Sent"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep === "warranty" && (
            <WarrantySelectionStep
              onSelectWarranty={handleWarrantySelect}
              onSkip={handleSkipWarranty}
            />
          )}
          
          {currentStep === "send-method" && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Send estimate {estimateNumber} to {contactInfo.name}:
              </div>
              
              <RadioGroup value={sendMethod} onValueChange={handleSendMethodChange}>
                <div className={`flex items-start space-x-3 border rounded-md p-3 mb-3 hover:bg-muted/50 cursor-pointer ${
                  sendMethod === "email" ? "border-primary bg-primary/5" : "border-input"
                }`}>
                  <RadioGroupItem value="email" id="email" className="mt-1" disabled={!hasValidEmail} />
                  <div className="flex-1">
                    <Label htmlFor="email" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Mail size={16} />
                      Send via Email
                    </Label>
                    {hasValidEmail ? (
                      <p className="text-sm text-muted-foreground mt-1">{contactInfo.email}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No valid email available for this client</p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">Includes secure portal access link</p>
                  </div>
                </div>
                
                <div className={`flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 cursor-pointer ${
                  sendMethod === "sms" ? "border-primary bg-primary/5" : "border-input"
                }`}>
                  <RadioGroupItem value="sms" id="sms" className="mt-1" disabled={!hasValidPhone} />
                  <div className="flex-1">
                    <Label htmlFor="sms" className="flex items-center gap-2 font-medium cursor-pointer">
                      <MessageSquare size={16} />
                      Send via Text Message
                    </Label>
                    {hasValidPhone ? (
                      <p className="text-sm text-muted-foreground mt-1">{contactInfo.phone}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No valid phone number available for this client</p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">Includes secure portal access link</p>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="space-y-2">
                <Label htmlFor="send-to">
                  {sendMethod === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="send-to"
                  value={sendTo}
                  onChange={(e) => {
                    setSendTo(e.target.value);
                    setValidationError("");
                  }}
                  placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890 or (555) 123-4567"}
                  className={validationError ? "border-red-500" : ""}
                />
                {validationError && (
                  <p className="text-sm text-red-600 mt-1">{validationError}</p>
                )}
                {sendMethod === "sms" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Phone numbers will be automatically formatted for SMS delivery
                  </p>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCurrentStep("warranty")}>
                  Back
                </Button>
                <Button 
                  onClick={handleSendEstimate} 
                  disabled={!sendTo || isProcessing || !!validationError}
                >
                  {isProcessing ? "Sending..." : "Send Estimate"}
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === "confirmation" && (
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Estimate Sent Successfully</h3>
              <p className="text-muted-foreground mb-6">
                The estimate has been sent to the client via {sendMethod === "email" ? "email" : "text message"}.
                {sendMethod === "email" && (
                  <span className="block mt-2">The client can access their portal to view, approve, or reject the estimate.</span>
                )}
                {sendMethod === "sms" && (
                  <span className="block mt-2">The client can access their portal to view, approve, or reject the estimate via the secure link.</span>
                )}
                {customNote && <span className="block mt-2">Your warranty recommendation was included.</span>}
              </p>
              <Button onClick={handleCloseAfterSend}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
