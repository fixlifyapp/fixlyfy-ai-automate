
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { LineItem } from "../../builder/types";
import { SendDocumentDialog } from "../shared/SendDocumentDialog";
import { useInvoiceSendingInterface } from "../shared/hooks/useSendingInterface";
import { useJobData } from "../unified/hooks/useJobData";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvoiceSendStepProps {
  invoiceNumber: string;
  lineItems: LineItem[];
  notes: string;
  total: number;
  jobId: string;
  onSave: () => Promise<boolean>;
  onClose: () => void;
  onBack?: () => void;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  invoiceId?: string;
}

export const InvoiceSendStep = ({
  invoiceNumber,
  lineItems,
  notes,
  total,
  jobId,
  onSave,
  onClose,
  onBack,
  contactInfo: providedContactInfo,
  invoiceId
}: InvoiceSendStepProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const { sendDocument, isProcessing } = useInvoiceSendingInterface();
  const { clientInfo, loading } = useJobData(jobId);
  const isMobile = useIsMobile();

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

  const handleSend = async (params: {
    sendMethod: "email" | "sms";
    sendTo: string;
    customNote: string;
  }) => {
    const result = await sendDocument({
      sendMethod: params.sendMethod,
      sendTo: params.sendTo,
      documentNumber: invoiceNumber,
      documentDetails: { invoice_number: invoiceNumber },
      lineItems,
      contactInfo: contactInfo || { name: '', email: '', phone: '' },
      customNote: params.customNote || notes,
      jobId,
      onSave,
      existingDocumentId: invoiceId || ''
    });

    if (result.success) {
      onClose();
    }

    return result;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  // Auto-open send dialog after component mounts
  useEffect(() => {
    if (!loading) {
      setShowSendDialog(true);
    }
  }, [loading]);

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
    <>
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
        </div>
      </div>

      {/* Send Dialog */}
      <SendDocumentDialog
        isOpen={showSendDialog}
        onClose={() => {
          setShowSendDialog(false);
          onClose();
        }}
        onBack={() => {
          setShowSendDialog(false);
          handleBack();
        }}
        documentType="invoice"
        documentId={invoiceId || ''}
        documentNumber={invoiceNumber}
        total={total}
        contactInfo={contactInfo}
        onSend={handleSend}
        isProcessing={isProcessing}
      />
    </>
  );
};
