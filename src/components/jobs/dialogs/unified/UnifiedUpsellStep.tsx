
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EstimateUpsellStep } from "../estimate-builder/EstimateUpsellStep";
import { InvoiceUpsellStep } from "../invoice-builder/InvoiceUpsellStep";
import { UpsellItem } from "../shared/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedUpsellStepProps {
  documentType: "estimate" | "invoice";
  documentTotal: number;
  onContinue: (upsells: UpsellItem[], notes: string) => void;
  onBack: () => void;
  existingUpsellItems: UpsellItem[];
  jobContext: any;
}

export const UnifiedUpsellStep = ({
  documentType,
  documentTotal,
  onContinue,
  onBack,
  existingUpsellItems,
  jobContext
}: UnifiedUpsellStepProps) => {
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [notes, setNotes] = useState("");
  const isMobile = useIsMobile();

  const handleContinue = () => {
    onContinue(selectedUpsells, notes);
  };

  const handleUpsellStepContinue = (upsells: UpsellItem[], upsellNotes: string) => {
    setSelectedUpsells(upsells);
    setNotes(upsellNotes);
    onContinue(upsells, upsellNotes);
  };

  return (
    <div className="space-y-6">
      {documentType === "estimate" ? (
        <EstimateUpsellStep
          documentTotal={documentTotal}
          onContinue={handleUpsellStepContinue}
          onBack={onBack}
          existingUpsellItems={existingUpsellItems}
          jobContext={jobContext}
        />
      ) : (
        <InvoiceUpsellStep
          documentTotal={documentTotal}
          onContinue={handleUpsellStepContinue}
          onBack={onBack}
          existingUpsellItems={existingUpsellItems}
          estimateToConvert={undefined}
          jobContext={jobContext}
        />
      )}
    </div>
  );
};
