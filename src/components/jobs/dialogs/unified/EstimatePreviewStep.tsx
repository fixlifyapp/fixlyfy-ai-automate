
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Send, ArrowRight } from "lucide-react";
import { LineItem } from "../../builder/types";
import { UnifiedDocumentPreview } from "./UnifiedDocumentPreview";
import { DocumentConversionDialog } from "../DocumentConversionDialog";
import { useDocumentConversion } from "@/hooks/useDocumentConversion";

interface EstimatePreviewStepProps {
  estimateNumber: string;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  jobData?: any;
  onSave: () => Promise<void>;
  onConvertToInvoice: () => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
  estimateId?: string;
}

export const EstimatePreviewStep = ({
  estimateNumber,
  lineItems,
  subtotal,
  taxAmount,
  total,
  notes,
  jobData,
  onSave,
  onConvertToInvoice,
  onBack,
  isSaving,
  estimateId
}: EstimatePreviewStepProps) => {
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const { convertEstimateToInvoice, isConverting } = useDocumentConversion();

  const currentEstimate = {
    id: estimateId || "temp-estimate-id",
    number: estimateNumber,
    type: "estimate" as const,
    total,
    lineItems,
    client: jobData?.client?.name || "Client",
    jobId: jobData?.id || ""
  };

  const handleConversion = async (conversionData: any) => {
    if (estimateId) {
      return await convertEstimateToInvoice(estimateId);
    } else {
      // Save first, then convert
      await onSave();
      return await onConvertToInvoice();
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Preview Document */}
        <UnifiedDocumentPreview
          documentType="estimate"
          documentNumber={estimateNumber}
          lineItems={lineItems}
          taxRate={taxAmount / subtotal || 0}
          calculateSubtotal={() => subtotal}
          calculateTotalTax={() => taxAmount}
          calculateGrandTotal={() => total}
          notes={notes}
          jobId={jobData?.id}
        />

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button variant="outline" onClick={onBack} className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Items
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={onSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>

                <Button
                  onClick={() => setShowConversionDialog(true)}
                  disabled={isSaving || isConverting}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Convert to Invoice
                </Button>

                <Button
                  variant="default"
                  onClick={onSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Estimate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Conversion Dialog */}
      <DocumentConversionDialog
        open={showConversionDialog}
        onOpenChange={setShowConversionDialog}
        sourceDocument={currentEstimate}
        onConvert={handleConversion}
        onPaymentRecorded={() => {
          // Handle payment recorded - could refresh job data
          console.log('Payment recorded for converted invoice');
        }}
      />
    </>
  );
};
