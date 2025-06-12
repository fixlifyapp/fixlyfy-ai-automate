
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, FileText, DollarSign, User, MapPin, CreditCard } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { formatCurrency } from "@/lib/utils";
import { DocumentConversionDialog } from "../DocumentConversionDialog";
import { PaymentRecordingModal } from "../PaymentRecordingModal";
import { useEstimates } from "@/hooks/useEstimates";
import { useInvoices } from "@/hooks/useInvoices";

interface UnifiedReviewStepProps {
  documentType: DocumentType;
  documentNumber: string;
  jobData: {
    id: string;
    title: string;
    client?: any;
    description?: string;
  };
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const UnifiedReviewStep = ({
  documentType,
  documentNumber,
  jobData,
  lineItems,
  taxRate,
  notes,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: UnifiedReviewStepProps) => {
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { convertEstimateToInvoice } = useEstimates();
  const { refreshInvoices } = useInvoices();

  const currentDocument = {
    id: "temp-id", // This would be the actual document ID
    number: documentNumber,
    type: documentType,
    total: calculateGrandTotal(),
    lineItems,
    client: jobData.client?.name || "Client",
    jobId: jobData.id
  };

  const handleConversion = async (conversionData: any) => {
    if (documentType === "estimate") {
      // Convert estimate to invoice
      const success = await convertEstimateToInvoice(conversionData.sourceId);
      if (success) {
        // Return the new invoice data for payment recording
        return {
          id: "new-invoice-id", // This would be the actual invoice ID
          invoice_number: `INV-${Date.now()}`,
          total: calculateGrandTotal(),
          amount_paid: 0,
          balance: calculateGrandTotal()
        };
      }
      throw new Error("Conversion failed");
    }
    return null;
  };

  const handlePaymentRecorded = () => {
    refreshInvoices();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Document Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {documentType === "estimate" ? (
                  <FileText className="h-6 w-6 text-blue-600" />
                ) : (
                  <DollarSign className="h-6 w-6 text-green-600" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    {documentType === "estimate" ? "Estimate" : "Invoice"} Preview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">
                    {documentNumber}
                  </p>
                </div>
              </div>
              <Badge variant={documentType === "estimate" ? "secondary" : "default"}>
                {documentType === "estimate" ? "Estimate" : "Invoice"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Job & Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Job & Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Job Title</h4>
                <p className="font-semibold">{jobData.title}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Client</h4>
                <p className="font-semibold">{jobData.client?.name || "N/A"}</p>
              </div>
              {jobData.client?.email && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
                  <p>{jobData.client.email}</p>
                </div>
              )}
              {jobData.client?.phone && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Phone</h4>
                  <p>{jobData.client.phone}</p>
                </div>
              )}
            </div>
            {jobData.description && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                <p className="text-sm">{jobData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items & Services</CardTitle>
          </CardHeader>
          <CardContent>
            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added to this {documentType}
              </div>
            ) : (
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.description}</h4>
                      <div className="text-sm text-muted-foreground mt-1">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.taxable && " (Taxable)"}
                        {item.discount > 0 && ` • ${item.discount}% discount`}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        {lineItems.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                    <span>{formatCurrency(calculateTotalTax())}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {documentType === "estimate" && (
                <Button
                  onClick={() => setShowConversionDialog(true)}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <ArrowRight className="h-4 w-4" />
                  Convert to Invoice
                </Button>
              )}
              
              {documentType === "invoice" && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Conversion Dialog */}
      <DocumentConversionDialog
        open={showConversionDialog}
        onOpenChange={setShowConversionDialog}
        sourceDocument={currentDocument}
        onConvert={handleConversion}
        onPaymentRecorded={handlePaymentRecorded}
      />

      {/* Payment Recording Modal */}
      {documentType === "invoice" && (
        <PaymentRecordingModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoice={{
            id: currentDocument.id,
            invoice_number: documentNumber,
            total: calculateGrandTotal(),
            amount_paid: 0,
            balance: calculateGrandTotal()
          }}
          jobId={jobData.id}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </>
  );
};
