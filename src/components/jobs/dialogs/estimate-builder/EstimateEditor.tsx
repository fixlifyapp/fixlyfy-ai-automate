
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineItem } from "@/components/jobs/builder/types";
import { ProductCatalog } from "@/components/jobs/builder/ProductCatalog";
import { LineItemsTable } from "./LineItemsTable";
import { EstimateSummary } from "./EstimateSummary";
import { EstimateSyncOptions } from "./EstimateSyncOptions";
import { EstimateUpsellOptions } from "./EstimateUpsellOptions";
import { Plus, RefreshCw, Search } from "lucide-react";

interface EstimateEditorProps {
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  onNotesChange: (notes: string) => void;
  onTaxRateChange: (rate: string) => void;
  onAddProduct: (product: any) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  onSyncToInvoice: () => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
}

export const EstimateEditor = ({
  estimateNumber,
  lineItems,
  notes,
  taxRate,
  onNotesChange,
  onTaxRateChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  onSyncToInvoice,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage
}: EstimateEditorProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Section - Estimate Builder */}
      <div className="lg:col-span-2 space-y-6">
        {/* Estimate Header Section */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-2">
            <Label htmlFor="estimate-number">Estimate #</Label>
            <Input
              id="estimate-number"
              value={estimateNumber}
              readOnly
              className="w-40 bg-muted/50"
            />
          </div>
          
          <div className="space-y-2 flex-1">
            <Label htmlFor="client-name">Client</Label>
            <Input
              id="client-name"
              value="Michael Johnson"
              readOnly
              className="bg-muted/50"
            />
          </div>

          <div className="ml-auto space-x-2">
            {/* Sync Options Button */}
            <EstimateSyncOptions onSyncToInvoice={onSyncToInvoice} />
            
            {/* Upsell Options Button */}
            <EstimateUpsellOptions onAddCustomLine={onAddCustomLine} />
          </div>
        </div>
        
        {/* Line Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Line Items</h3>
          </div>
          
          <LineItemsTable 
            lineItems={lineItems}
            onUpdateLineItem={onUpdateLineItem}
            onEditLineItem={onEditLineItem}
            onRemoveLineItem={onRemoveLineItem}
          />
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={onAddEmptyLineItem}
            >
              <Search size={16} />
              Add from Catalog
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={onAddCustomLine}
            >
              <Plus size={16} />
              Add Custom Line
            </Button>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes & Terms</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded-md resize-y"
            placeholder="Add notes or terms and conditions..."
          />
        </div>
      </div>
      
      {/* Right Section - Catalog & Summary */}
      <div className="lg:col-span-1">
        {/* Fixed position on desktop, scrollable on mobile */}
        <div className="space-y-6">
          {/* Summary Card */}
          <EstimateSummary
            taxRate={taxRate}
            onTaxRateChange={onTaxRateChange}
            calculateSubtotal={calculateSubtotal}
            calculateTotalTax={calculateTotalTax}
            calculateGrandTotal={calculateGrandTotal}
            calculateTotalMargin={calculateTotalMargin}
            calculateMarginPercentage={calculateMarginPercentage}
          />
          
          {/* Product Catalog */}
          <ProductCatalog onAddProduct={onAddProduct} />
        </div>
      </div>
    </div>
  );
};
