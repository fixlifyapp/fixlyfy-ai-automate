
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

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

const formatPhoneForTelnyx = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  return `+1${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
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
  // Check if manual input is valid
  const isManualEmailValid = sendMethod === "email" && isValidEmail(sendTo);
  const isManualPhoneValid = sendMethod === "sms" && isValidPhoneNumber(sendTo);
  const canSend = isManualEmailValid || isManualPhoneValid;

  const handleInputChange = (value: string) => {
    setSendTo(value);
    setValidationError("");
  };

  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    setValidationError("");
    
    // Auto-fill with client info only if the field is empty
    if (!sendTo.trim()) {
      if (value === "email" && hasValidEmail) {
        setSendTo(contactInfo.email);
      } else if (value === "sms" && hasValidPhone) {
        const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
        setSendTo(formattedPhone);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Отправить estimate {estimateNumber} клиенту {contactInfo.name}:
      </div>
      
      <div className="text-sm font-medium mb-3">Выберите способ отправки:</div>
      
      <RadioGroup value={sendMethod} onValueChange={handleSendMethodChange}>
        <div className={`flex items-start space-x-3 border rounded-md p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
          sendMethod === "email" ? "border-primary bg-primary/5" : "border-input"
        }`}>
          <RadioGroupItem value="email" id="email" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="email" className="flex items-center gap-2 font-medium cursor-pointer">
              <Mail size={16} />
              Отправить по Email
              {hasValidEmail && <CheckCircle size={14} className="text-green-600" />}
              {!hasValidEmail && <AlertCircle size={14} className="text-amber-500" />}
            </Label>
            {hasValidEmail ? (
              <p className="text-sm text-muted-foreground mt-1">
                Email клиента: <span className="font-medium">{contactInfo.email}</span>
              </p>
            ) : (
              <p className="text-sm text-amber-600 mt-1">Email клиента недоступен - можно ввести другой</p>
            )}
            <p className="text-xs text-blue-600 mt-1">Включает ссылку на защищенный портал клиента</p>
          </div>
        </div>
        
        <div className={`flex items-start space-x-3 border rounded-md p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
          sendMethod === "sms" ? "border-primary bg-primary/5" : "border-input"
        }`}>
          <RadioGroupItem value="sms" id="sms" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="sms" className="flex items-center gap-2 font-medium cursor-pointer">
              <MessageSquare size={16} />
              Отправить по SMS
              {hasValidPhone && <CheckCircle size={14} className="text-green-600" />}
              {!hasValidPhone && <AlertCircle size={14} className="text-amber-500" />}
            </Label>
            {hasValidPhone ? (
              <p className="text-sm text-muted-foreground mt-1">
                Телефон клиента: <span className="font-medium">{contactInfo.phone}</span>
              </p>
            ) : (
              <p className="text-sm text-amber-600 mt-1">Телефон клиента недоступен - можно ввести другой</p>
            )}
            <p className="text-xs text-blue-600 mt-1">Включает ссылку на защищенный портал клиента</p>
          </div>
        </div>
      </RadioGroup>
      
      {/* Always show editable field */}
      <div className="space-y-2">
        <Label htmlFor="send-to">
          {sendMethod === "email" ? "Email адрес" : "Номер телефона"}
        </Label>
        <Input
          id="send-to"
          value={sendTo}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890 или (555) 123-4567"}
          className={validationError ? "border-red-500" : ""}
        />
        {validationError && (
          <p className="text-sm text-red-600 mt-1">{validationError}</p>
        )}
        {sendMethod === "sms" && (
          <p className="text-xs text-muted-foreground mt-1">
            Номера телефонов будут автоматически отформатированы для Telnyx
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          💡 Можете ввести любой {sendMethod === "email" ? "email адрес" : "номер телефона"} - это не изменит контактную информацию клиента
        </p>
      </div>
      
      <div className="pt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Назад
        </Button>
        <Button 
          onClick={onSend} 
          disabled={!canSend || isProcessing || !!validationError}
        >
          {isProcessing ? "Отправляю..." : "Отправить Estimate"}
        </Button>
      </div>
    </div>
  );
};
