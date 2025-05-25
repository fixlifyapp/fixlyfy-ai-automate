
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

export const EstimateSendDialog = ({
  open,
  onOpenChange,
  onSave,
  onAddWarranty,
  clientInfo,
  estimateNumber
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
  
  // Fetch estimate and client details when dialog opens
  useEffect(() => {
    if (open && estimateNumber) {
      fetchEstimateDetails();
    }
  }, [open, estimateNumber]);

  const fetchEstimateDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch estimate details with client info using the view
      const { data: details, error: detailsError } = await supabase
        .from('estimate_details_view')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .single();

      if (detailsError) {
        console.error('Error fetching estimate details:', detailsError);
        toast.error('Failed to load estimate details');
        return;
      }

      if (details) {
        setEstimateDetails(details);
        
        // Set default send method and recipient based on available contact info
        if (details.client_email) {
          setSendMethod("email");
          setSendTo(details.client_email);
        } else if (details.client_phone) {
          setSendMethod("sms");
          setSendTo(details.client_phone);
        }

        // Fetch line items for this estimate
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'estimate')
          .eq('parent_id', details.estimate_id);

        if (itemsError) {
          console.error('Error fetching line items:', itemsError);
        } else if (items) {
          setLineItems(items);
        }
      }
    } catch (error) {
      console.error('Error in fetchEstimateDetails:', error);
      toast.error('Failed to load estimate data');
    } finally {
      setIsLoading(false);
    }
  };

  const hasEmail = !!estimateDetails?.client_email;
  const hasPhone = !!estimateDetails?.client_phone;
  
  // Reset the dialog state when opened
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setCurrentStep("warranty");
      setIsProcessing(false);
      setCustomNote("");
    } else {
      // Clear data when closing
      setEstimateDetails(null);
      setLineItems([]);
      setSendTo("");
    }
    onOpenChange(newOpen);
  };
  
  // Handle warranty selection
  const handleWarrantySelect = (warranty: Product | null, note: string) => {
    if (warranty) {
      onAddWarranty(warranty, note);
      setCustomNote(note);
    }
    
    // Move to next step
    setCurrentStep("send-method");
  };
  
  // Handle skipping warranty
  const handleSkipWarranty = () => {
    setCurrentStep("send-method");
  };
  
  // Send the estimate to the client
  const handleSendEstimate = async () => {
    if (!estimateDetails) {
      toast.error("Estimate details not loaded");
      return;
    }

    setIsProcessing(true);
    
    try {
      // First save the estimate
      const success = await onSave();
      
      if (success) {
        // Create estimate communication record
        const { data: commData, error: commError } = await supabase
          .from('estimate_communications')
          .insert({
            estimate_id: estimateDetails.estimate_id,
            communication_type: sendMethod,
            recipient: sendTo,
            subject: sendMethod === 'email' ? `Estimate ${estimateNumber}` : null,
            content: sendMethod === 'sms' 
              ? `Hi ${estimateDetails.client_name}! Your estimate ${estimateNumber} is ready. Total: $${estimateDetails.total.toFixed(2)}. Please review and let us know if you have any questions.`
              : `Please find your estimate ${estimateNumber} attached. Total: $${estimateDetails.total.toFixed(2)}`,
            status: 'pending',
            estimate_number: estimateNumber,
            client_name: estimateDetails.client_name,
            client_email: estimateDetails.client_email,
            client_phone: estimateDetails.client_phone
          })
          .select()
          .single();

        if (commError) {
          console.error('Error creating communication record:', commError);
          toast.error('Failed to create communication record');
          setIsProcessing(false);
          return;
        }

        // Prepare estimate data for the edge function
        const estimateData = {
          lineItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            taxable: item.taxable,
            total: item.quantity * Number(item.unit_price)
          })),
          total: estimateDetails.total,
          taxRate: 13, // Default tax rate - could be made configurable
          notes: customNote || estimateDetails.notes
        };

        // Call the edge function to send the estimate
        const { data, error } = await supabase.functions.invoke('send-estimate', {
          body: {
            method: sendMethod,
            recipient: sendTo,
            estimateNumber: estimateNumber,
            estimateData: estimateData,
            clientName: estimateDetails.client_name,
            communicationId: commData.id
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data?.success) {
          const method = sendMethod === "email" ? "email" : "text message";
          toast.success(`Estimate ${estimateNumber} sent to client via ${method}`);
          
          // Move to confirmation step
          setCurrentStep("confirmation");
        } else {
          // Update communication record as failed
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
      } else {
        toast.error("Failed to save estimate. Please try again.");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Error sending estimate:", error);
      toast.error(`An error occurred while sending the estimate: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  // Close the dialog and redirect to estimates tab
  const handleCloseAfterSend = () => {
    // Close the dialog
    onOpenChange(false);
    
    // Get the current URL path
    const currentPath = window.location.pathname;
    
    // If we're on a job details page, navigate to the estimates tab
    if (currentPath.includes('/jobs/')) {
      // Extract the job ID from the current URL
      const jobId = currentPath.split('/').pop();
      
      // Use navigate to stay on same page but switch to estimates tab
      const jobDetailsUrl = `/jobs/${jobId}`;
      
      // Navigate to job details with estimates tab selected
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
          {/* Warranty Selection Step */}
          {currentStep === "warranty" && (
            <WarrantySelectionStep
              onSelectWarranty={handleWarrantySelect}
              onSkip={handleSkipWarranty}
            />
          )}
          
          {/* Send Method Step */}
          {currentStep === "send-method" && estimateDetails && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Send estimate {estimateNumber} to {estimateDetails.client_name}:
              </div>
              
              <RadioGroup value={sendMethod} onValueChange={(v) => setSendMethod(v as "email" | "sms")}>
                <div className={`flex items-start space-x-3 border rounded-md p-3 mb-3 hover:bg-muted/50 cursor-pointer ${
                  sendMethod === "email" ? "border-primary bg-primary/5" : "border-input"
                }`}>
                  <RadioGroupItem value="email" id="email" className="mt-1" disabled={!hasEmail} />
                  <div className="flex-1">
                    <Label htmlFor="email" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Mail size={16} />
                      Send via Email
                    </Label>
                    {hasEmail ? (
                      <p className="text-sm text-muted-foreground mt-1">{estimateDetails.client_email}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No email available for this client</p>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 cursor-pointer ${
                  sendMethod === "sms" ? "border-primary bg-primary/5" : "border-input"
                }`}>
                  <RadioGroupItem value="sms" id="sms" className="mt-1" disabled={!hasPhone} />
                  <div className="flex-1">
                    <Label htmlFor="sms" className="flex items-center gap-2 font-medium cursor-pointer">
                      <MessageSquare size={16} />
                      Send via Text Message
                    </Label>
                    {hasPhone ? (
                      <p className="text-sm text-muted-foreground mt-1">{estimateDetails.client_phone}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No phone number available for this client</p>
                    )}
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
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder={sendMethod === "email" ? "client@example.com" : "(555) 123-4567"}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCurrentStep("warranty")}>
                  Back
                </Button>
                <Button 
                  onClick={handleSendEstimate} 
                  disabled={!sendTo || isProcessing || (!hasEmail && !hasPhone)}
                >
                  {isProcessing ? "Sending..." : "Send Estimate"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Confirmation Step */}
          {currentStep === "confirmation" && (
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Estimate Sent Successfully</h3>
              <p className="text-muted-foreground mb-6">
                The estimate has been sent to the client via {sendMethod === "email" ? "email" : "text message"}.
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
