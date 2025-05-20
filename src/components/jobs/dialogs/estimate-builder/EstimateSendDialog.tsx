
import { useState } from "react";
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

interface EstimateSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<boolean>;
  onAddWarranty: (warranty: Product | null, note: string) => void;
  clientInfo?: { email?: string; phone?: string } | null;
  estimateNumber: string;
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
  
  const hasEmail = !!clientInfo?.email;
  const hasPhone = !!clientInfo?.phone;
  
  // Reset the dialog state when opened
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setCurrentStep("warranty");
      setSendMethod(hasEmail ? "email" : "sms");
      setSendTo(hasEmail ? clientInfo?.email || "" : clientInfo?.phone || "");
      setIsProcessing(false);
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
    setIsProcessing(true);
    
    try {
      // First save the estimate
      const success = await onSave();
      
      if (success) {
        // In a real implementation, we would send the estimate via email or SMS here
        // For now, we'll just show a success message
        
        const method = sendMethod === "email" ? "email" : "text message";
        
        toast.success(`Estimate ${estimateNumber} will be sent to client via ${method}`);
        
        // Move to confirmation step
        setCurrentStep("confirmation");
      } else {
        toast.error("Failed to save estimate. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error sending estimate:", error);
      toast.error("An error occurred while sending the estimate");
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
      // We'll use the current URL plus a query param to trigger the tab change
      const jobDetailsUrl = `/jobs/${jobId}`;
      
      // Navigate to job details with estimates tab selected
      // We'll handle this in the JobDetailsPage component
      navigate(jobDetailsUrl, { state: { activeTab: "estimates" } });
    }
  };
  
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
          {currentStep === "send-method" && (
            <div className="space-y-6">
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
                      <p className="text-sm text-muted-foreground mt-1">{clientInfo?.email}</p>
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
                      <p className="text-sm text-muted-foreground mt-1">{clientInfo?.phone}</p>
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
                  disabled={!sendTo || isProcessing}
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
                The estimate has been sent to the client.
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
