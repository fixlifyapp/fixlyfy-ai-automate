
import { EstimateForm } from "./EstimateForm";
import { UnifiedDocumentPreview } from "../unified/UnifiedDocumentPreview";
import { LineItem } from "@/components/jobs/builder/types";

interface EstimateBuilderContentProps {
  activeTab: string;
  estimateNumber: string;
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
  notes: string;
  clientInfo?: any;
  jobData?: any;
  jobId?: string; // Added jobId prop
}

export const EstimateBuilderContent = ({
  activeTab,
  estimateNumber,
  lineItems,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  taxRate,
  setTaxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage,
  notes,
  clientInfo,
  jobData,
  jobId
}: EstimateBuilderContentProps) => {
  return (
    <div className="flex-grow overflow-auto p-6">
      {activeTab === "form" && (
        <EstimateForm
          estimateNumber={estimateNumber}
          lineItems={lineItems || []}
          onRemoveLineItem={onRemoveLineItem}
          onUpdateLineItem={onUpdateLineItem}
          onEditLineItem={onEditLineItem}
          onAddEmptyLineItem={onAddEmptyLineItem}
          onAddCustomLine={onAddCustomLine}
          taxRate={taxRate}
          setTaxRate={setTaxRate}
          calculateSubtotal={calculateSubtotal}
          calculateTotalTax={calculateTotalTax}
          calculateGrandTotal={calculateGrandTotal}
          calculateTotalMargin={calculateTotalMargin}
          calculateMarginPercentage={calculateMarginPercentage}
          showMargin={false}
        />
      )}
      
      {activeTab === "preview" && (
        <UnifiedDocumentPreview
          documentType="estimate"
          documentNumber={estimateNumber}
          lineItems={lineItems || []}
          taxRate={taxRate}
          calculateSubtotal={calculateSubtotal}
          calculateTotalTax={calculateTotalTax}
          calculateGrandTotal={calculateGrandTotal}
          notes={notes || ""}
          clientInfo={clientInfo || jobData?.client}
          issueDate={new Date().toLocaleDateString()}
          dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          jobId={jobId}
        />
      )}
    </div>
  );
};
