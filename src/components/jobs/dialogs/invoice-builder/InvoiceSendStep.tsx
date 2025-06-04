
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Send } from "lucide-react";
import { LineItem } from "../../builder/types";
import { SendMethodStep } from "../estimate-builder/steps/SendMethodStep";
import { useInvoiceSending } from "./hooks/useInvoiceSending";

interface InvoiceSendStepProps {
  invoiceNumber: string;
  lineItems: LineItem[];
  notes: string;
  total: number;
  jobId: string;
  onSave: () => Promise<boolean>;
  onClose: () => void;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const InvoiceSendStep = ({
  invoiceNumber,
  lineItems,
  notes,
  total,
  jobId,
  onSave,
  onClose,
  contactInfo
}: InvoiceSendStepProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [validationError, setValidationError] = useState("");
  const { sendInvoice, isProcessing } = useInvoiceSending();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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

  const handleSend = async () => {
    const result = await sendInvoice({
      sendMethod,
      sendTo,
      invoiceNumber,
      invoiceDetails: { invoice_number: invoiceNumber },
      lineItems,
      contactInfo: contactInfo || { name: '', email: '', phone: '' },
      customNote: notes,
      jobId,
      onSave,
      existingInvoiceId: invoiceNumber
    });

    if (result.success) {
      onClose();
    }
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Invoice Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Preview
            </CardTitle>
            <Badge variant="secondary">#{invoiceNumber}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Line Items Summary */}
            <div>
              <h4 className="font-medium mb-3">Items ({lineItems.length})</h4>
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Method Selection */}
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
        estimateNumber={invoiceNumber}
        isProcessing={isProcessing}
        onSend={handleSend}
        onBack={handleBack}
      />
    </div>
  );
};
