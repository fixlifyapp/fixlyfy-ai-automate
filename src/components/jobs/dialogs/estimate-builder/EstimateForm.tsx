
import { LineItem } from "@/components/jobs/builder/types";
import { LineItemsTable } from "./LineItemsTable";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { EstimateSummary } from "./EstimateSummary";

interface EstimateFormProps {
  estimateNumber: string;
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string | null, field: string, value: any) => void;
  onEditLineItem: (id: string) => void;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
  showMargin?: boolean;
}

export const EstimateForm = ({ 
  estimateNumber, 
  lineItems = [], // Provide default empty array
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
  showMargin = true
}) => {
  // Implement handleTaxRateChange function
  const handleTaxRateChange = (value: string) => {
    // Convert to number, with boundary checks
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      setTaxRate(0);
    } else if (parsedValue < 0) {
      setTaxRate(0);
    } else if (parsedValue > 100) {
      setTaxRate(100);
    } else {
      setTaxRate(parsedValue);
    }
  };

  return (
    <div className="space-y-8">
      {/* Line Items Table */}
      <LineItemsTable
        lineItems={Array.isArray(lineItems) ? lineItems : []} // Ensure lineItems is always an array
        onRemoveLineItem={onRemoveLineItem}
        onUpdateLineItem={onUpdateLineItem}
        onEditLineItem={onEditLineItem}
      />
      
      {/* Actions: Add Line Item */}
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold">Add Item</h4>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onAddEmptyLineItem}>
            <Search size={16} className="mr-2" />
            Product
          </Button>
          <Button variant="outline" size="sm" onClick={onAddCustomLine}>
            <PlusCircle size={16} className="mr-2" />
            Custom Line
          </Button>
        </div>
      </div>
      
      {/* Estimate Summary section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          {/* Empty div for spacing or potential future content */}
        </div>
        
        <div className="lg:col-span-1">
          <EstimateSummary
            taxRate={taxRate}
            onTaxRateChange={handleTaxRateChange}
            calculateSubtotal={calculateSubtotal || (() => 0)}
            calculateTotalTax={calculateTotalTax || (() => 0)}
            calculateGrandTotal={calculateGrandTotal || (() => 0)}
            calculateTotalMargin={showMargin ? (calculateTotalMargin || (() => 0)) : undefined}
            calculateMarginPercentage={showMargin ? (calculateMarginPercentage || (() => 0)) : undefined}
          />
        </div>
      </div>
    </div>
  );
};
