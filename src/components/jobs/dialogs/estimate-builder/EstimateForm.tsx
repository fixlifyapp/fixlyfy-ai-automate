
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LineItemsTable } from "./LineItemsTable";
import { LineItem } from "@/components/jobs/builder/types";
import { EstimateSummary } from "./EstimateSummary";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface EstimateFormProps {
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
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
  showMargin?: boolean;
}

export const EstimateForm = ({
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
  showMargin = false
}: EstimateFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Estimate #{estimateNumber}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <LineItemsTable 
                lineItems={lineItems} 
                onRemoveLineItem={onRemoveLineItem}
                onUpdateLineItem={onUpdateLineItem}
                onEditLineItem={onEditLineItem}
                showMargin={showMargin}
              />
            </CardContent>
          </Card>
          
          <div className="mt-4 flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center"
              onClick={onAddEmptyLineItem}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Catalog Item
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center"
              onClick={onAddCustomLine}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Custom Line
            </Button>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea 
              placeholder="Enter any additional notes for this estimate..."
              className="min-h-[120px]"
              value=""
              onChange={(e) => onUpdateLineItem(null, "notes", e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <EstimateSummary
            taxRate={taxRate}
            onTaxRateChange={(value) => setTaxRate(parseFloat(value) || 0)}
            calculateSubtotal={calculateSubtotal}
            calculateTotalTax={calculateTotalTax}
            calculateGrandTotal={calculateGrandTotal}
            calculateTotalMargin={calculateTotalMargin}
            calculateMarginPercentage={calculateMarginPercentage}
            showMargin={showMargin}
          />
        </div>
      </div>
    </div>
  );
};
