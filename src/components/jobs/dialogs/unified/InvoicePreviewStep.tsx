
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { LineItem } from "../../builder/types";
import { UnifiedDocumentPreview } from "./UnifiedDocumentPreview";

interface InvoicePreviewStepProps {
  invoiceNumber: string;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  jobData?: any;
  onSave: () => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
}

export const InvoicePreviewStep = ({
  invoiceNumber,
  lineItems,
  subtotal,
  taxAmount,
  total,
  notes,
  jobData,
  onSave,
  onBack,
  isSaving
}: InvoicePreviewStepProps) => {
  return (
    <div className="space-y-6">
      {/* Preview Document */}
      <UnifiedDocumentPreview
        documentType="invoice"
        documentNumber={invoiceNumber}
        lineItems={lineItems}
        taxRate={taxAmount / subtotal || 0}
        calculateSubtotal={() => subtotal}
        calculateTotalTax={() => taxAmount}
        calculateGrandTotal={() => total}
        notes={notes}
        jobId={jobData?.id}
      />

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </Button>

        <div className="flex gap-3">
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
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};
