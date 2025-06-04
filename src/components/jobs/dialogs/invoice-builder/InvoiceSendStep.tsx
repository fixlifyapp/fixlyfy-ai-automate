
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Send } from "lucide-react";
import { LineItem } from "../../builder/types";
import { SendMethodStep } from "../estimate-builder/steps/SendMethodStep";
import { useInvoiceSending } from "./hooks/useInvoiceSending";
import { useJobData } from "../unified/hooks/useJobData";

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
  contactInfo: providedContactInfo
}: InvoiceSendStepProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState("");
  const [validationError, setValidationError] = useState("");
  const { sendInvoice, isProcessing } = useInvoiceSending();
  
  // Fetch job and client data
  const { clientInfo, loading } = useJobData(jobId);

  // Use the most complete contact information available
  const contactInfo = providedContactInfo || {
    name: clientInfo?.name || 'Client',
    email: clientInfo?.email || '',
    phone: clientInfo?.phone || ''
  };

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

  if (loading) {
    return (
      <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Send Invoice</h3>
            <Badge variant="secondary">#{invoiceNumber}</Badge>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Send Invoice</h3>
          <Badge variant="secondary">#{invoiceNumber}</Badge>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Invoice Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Line Items Summary - Mobile Responsive */}
              <div>
                <h4 className="font-medium mb-3">Items ({lineItems.length})</h4>
                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b last:border-b-0 gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base break-words">{item.description}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="font-medium text-sm sm:text-base self-end sm:self-auto">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-base sm:text-lg font-semibold">Total Amount:</span>
                  <span className="text-base sm:text-lg font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground break-words">{notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Send Method Selection */}
        <div className="w-full">
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
      </div>
    </div>
  );
};
