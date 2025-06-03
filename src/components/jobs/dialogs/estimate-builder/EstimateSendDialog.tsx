
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SendMethodStep } from "./steps/SendMethodStep";

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
  onSuccess?: () => void;
}

export const EstimateSendDialog = ({ 
  isOpen, 
  onClose, 
  estimateId, 
  estimateNumber, 
  total,
  contactInfo,
  onSuccess
}: EstimateSendDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Check if contact info has valid email/phone
  const hasValidEmail = contactInfo?.email && isValidEmail(contactInfo.email);
  const hasValidPhone = contactInfo?.phone && isValidPhoneNumber(contactInfo.phone);

  // Set default sendTo value when dialog opens or method changes
  React.useEffect(() => {
    if (isOpen) {
      if (sendMethod === "email" && hasValidEmail) {
        setSendTo(contactInfo.email);
      } else if (sendMethod === "sms" && hasValidPhone) {
        setSendTo(contactInfo.phone);
      } else {
        setSendTo("");
      }
      setValidationError("");
    }
  }, [isOpen, sendMethod, hasValidEmail, hasValidPhone, contactInfo]);

  const handleSend = async () => {
    setValidationError("");

    if (sendMethod === "email" && !isValidEmail(sendTo)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    
    if (sendMethod === "sms" && !isValidPhoneNumber(sendTo)) {
      setValidationError("Please enter a valid phone number");
      return;
    }

    if (sendMethod === "sms" && userPhoneNumbers.length === 0) {
      setValidationError("No Telnyx phone numbers available. Please purchase a phone number first.");
      return;
    }

    setIsProcessing(true);

    try {
      if (sendMethod === "email") {
        const { data, error } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId,
            sendMethod: "email",
            recipientEmail: sendTo,
            subject: `Estimate #${estimateNumber}`,
            message: ""
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
            recipientPhone: sendTo,
            fromNumber,
            message: `Hi ${contactInfo?.name || 'Customer'}! Your estimate #${estimateNumber} is ready. Total: $${total.toFixed(2)}. Please contact us if you have any questions.`
          }
        });

        if (error) throw error;
        toast.success("Estimate sent via SMS successfully!");
      }
      
      // Call the success callback to close the dialog and navigate
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Failed to send estimate');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    onClose();
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

          <SendMethodStep
            sendMethod={sendMethod}
            setSendMethod={setSendMethod}
            sendTo={sendTo}
            setSendTo={setSendTo}
            validationError={validationError}
            setValidationError={setValidationError}
            contactInfo={contactInfo || { name: '', email: '', phone: '' }}
            hasValidEmail={!!hasValidEmail}
            hasValidPhone={!!hasValidPhone}
            estimateNumber={estimateNumber}
            isProcessing={isProcessing}
            onSend={handleSend}
            onBack={handleBack}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
