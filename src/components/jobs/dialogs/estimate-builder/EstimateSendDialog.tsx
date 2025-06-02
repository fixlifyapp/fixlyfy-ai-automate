
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WarrantySelectionStep } from "./WarrantySelectionStep";
import { SendMethodStep } from "./steps/SendMethodStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { Product } from "../../builder/types";
import { useNavigate } from "react-router-dom";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";
import { useEstimateData } from "./hooks/useEstimateData";
import { useEstimateSending } from "./hooks/useEstimateSending";

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

type SendStep = "warranty" | "send-method" | "confirmation";

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
  const [customNote, setCustomNote] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  
  const { estimateDetails, lineItems, isLoading, refetchData } = useEstimateData(estimateNumber, jobId);
  const { sendEstimate, isProcessing } = useEstimateSending();
  
  // Use client info from props first, then from estimate details as fallback
  const getClientContactInfo = () => {
    console.log("PropClientInfo:", propClientInfo);
    console.log("EstimateDetails client info:", estimateDetails);
    
    // Prioritize prop client info if available and valid
    if (propClientInfo && propClientInfo.name && propClientInfo.name !== 'Unknown Client') {
      const contactData = {
        name: propClientInfo.name || 'Unknown Client',
        email: propClientInfo.email || '',
        phone: propClientInfo.phone || ''
      };
      console.log("Using prop client info:", contactData);
      return contactData;
    }
    
    // Fallback to estimate details
    if (estimateDetails && estimateDetails.client_name !== 'Unknown Client') {
      const contactData = {
        name: estimateDetails.client_name || 'Unknown Client',
        email: estimateDetails.client_email || '',
        phone: estimateDetails.client_phone || ''
      };
      console.log("Using estimate details client info:", contactData);
      return contactData;
    }
    
    // Final fallback
    const fallbackData = {
      name: 'Unknown Client',
      email: '',
      phone: ''
    };
    console.log("Using fallback client info:", fallbackData);
    return fallbackData;
  };

  const contactInfo = getClientContactInfo();
  const hasValidEmail = isValidEmail(contactInfo.email);
  const hasValidPhone = isValidPhoneNumber(contactInfo.phone);
  
  console.log("Final contact validation - Email valid:", hasValidEmail, "Phone valid:", hasValidPhone);
  console.log("Final contact info:", contactInfo);

  useEffect(() => {
    if (contactInfo.name !== 'Unknown Client') {
      setValidationError("");
      
      if (hasValidEmail && sendMethod === "email") {
        setSendTo(contactInfo.email);
      } else if (hasValidPhone && sendMethod === "sms") {
        const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
        setSendTo(formattedPhone);
        console.log("Auto-filled phone number:", formattedPhone);
      } else if (hasValidEmail && !hasValidPhone) {
        setSendMethod("email");
        setSendTo(contactInfo.email);
      } else if (hasValidPhone && !hasValidEmail) {
        setSendMethod("sms");
        const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
        setSendTo(formattedPhone);
      }
    }
  }, [contactInfo, sendMethod, hasValidEmail, hasValidPhone]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      console.log("Dialog opening, resetting state");
      setCurrentStep("warranty");
      setCustomNote("");
      setValidationError("");
    } else {
      console.log("Dialog closing, clearing data");
      setSendTo("");
      setValidationError("");
      setCurrentStep("warranty");
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
      const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
      setSendTo(formattedPhone);
    } else {
      setSendTo("");
    }
  };
  
  const handleSendEstimate = async () => {
    const result = await sendEstimate({
      sendMethod,
      sendTo,
      estimateNumber,
      estimateDetails,
      lineItems,
      contactInfo,
      customNote,
      jobId,
      onSave
    });

    if (result.success) {
      setCurrentStep("confirmation");
    } else {
      setValidationError(result.error || "Failed to send estimate");
    }
  };
  
  const handleCloseAfterSend = () => {
    handleOpenChange(false);
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
            <SendMethodStep
              sendMethod={sendMethod}
              setSendMethod={handleSendMethodChange}
              sendTo={sendTo}
              setSendTo={setSendTo}
              validationError={validationError}
              setValidationError={setValidationError}
              contactInfo={contactInfo}
              hasValidEmail={hasValidEmail}
              hasValidPhone={hasValidPhone}
              estimateNumber={estimateNumber}
              isProcessing={isProcessing}
              onSend={handleSendEstimate}
              onBack={() => setCurrentStep("warranty")}
            />
          )}
          
          {currentStep === "confirmation" && (
            <ConfirmationStep
              sendMethod={sendMethod}
              customNote={customNote}
              onClose={handleCloseAfterSend}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
