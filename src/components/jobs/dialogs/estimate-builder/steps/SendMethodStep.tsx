
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Edit } from "lucide-react";

interface SendMethodStepProps {
  sendMethod: "email" | "sms";
  setSendMethod: (method: "email" | "sms") => void;
  sendTo: string;
  setSendTo: (value: string) => void;
  validationError: string;
  setValidationError: (error: string) => void;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  hasValidEmail: boolean;
  hasValidPhone: boolean;
  estimateNumber: string;
  isProcessing: boolean;
  onSend: () => void;
  onBack: () => void;
}

// Helper functions for validation
const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};

export const SendMethodStep = ({
  sendMethod,
  setSendMethod,
  sendTo,
  setSendTo,
  validationError,
  setValidationError,
  contactInfo,
  hasValidEmail,
  hasValidPhone,
  estimateNumber,
  isProcessing,
  onSend,
  onBack
}: SendMethodStepProps) => {
  const [useCustomContact, setUseCustomContact] = useState(false);

  // Check if manual input is valid
  const isManualEmailValid = sendMethod === "email" && isValidEmail(sendTo);
  const isManualPhoneValid = sendMethod === "sms" && isValidPhoneNumber(sendTo);
  const canSend = isManualEmailValid || isManualPhoneValid;

  const handleUseClientContact = () => {
    setUseCustomContact(false);
    if (sendMethod === "email" && hasValidEmail) {
      setSendTo(contactInfo.email);
    } else if (sendMethod === "sms" && hasValidPhone) {
      setSendTo(contactInfo.phone);
    }
    setValidationError("");
  };

  const handleUseCustomContact = () => {
    setUseCustomContact(true);
    setSendTo("");
    setValidationError("");
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Send estimate {estimateNumber} to {contactInfo.name}:
      </div>
      
      <RadioGroup value={sendMethod} onValueChange={setSendMethod}>
        <div className={`flex items-start space-x-3 border rounded-md p-3 mb-3 hover:bg-muted/50 cursor-pointer ${
          sendMethod === "email" ? "border-primary bg-primary/5" : "border-input"
        }`}>
          <RadioGroupItem value="email" id="email" className="mt-1" />
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
          <RadioGroupItem value="sms" id="sms" className="mt-1" />
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

      {/* Contact method selection */}
      {((sendMethod === "email" && hasValidEmail) || (sendMethod === "sms" && hasValidPhone)) && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Contact Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="use-client-contact"
                name="contact-option"
                checked={!useCustomContact}
                onChange={handleUseClientContact}
                className="w-4 h-4"
              />
              <Label htmlFor="use-client-contact" className="text-sm cursor-pointer">
                Use client's {sendMethod === "email" ? "email" : "phone number"}: {sendMethod === "email" ? contactInfo.email : contactInfo.phone}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="use-custom-contact"
                name="contact-option"
                checked={useCustomContact}
                onChange={handleUseCustomContact}
                className="w-4 h-4"
              />
              <Label htmlFor="use-custom-contact" className="text-sm cursor-pointer flex items-center gap-1">
                <Edit size={14} />
                Use different {sendMethod === "email" ? "email address" : "phone number"}
              </Label>
            </div>
          </div>
        </div>
      )}
      
      {/* Manual input field - always show if no valid contact info or if custom option is selected */}
      {(useCustomContact || !((sendMethod === "email" && hasValidEmail) || (sendMethod === "sms" && hasValidPhone))) && (
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
              Phone numbers will be automatically formatted for Telnyx delivery
            </p>
          )}
          <p className="text-xs text-blue-600 mt-1">
            Enter the {sendMethod === "email" ? "email address" : "phone number"} to send the estimate
          </p>
        </div>
      )}
      
      <div className="pt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onSend} 
          disabled={!canSend || isProcessing || !!validationError}
        >
          {isProcessing ? "Sending..." : "Send Estimate"}
        </Button>
      </div>
    </div>
  );
};
