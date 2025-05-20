
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface EstimateSummaryProps {
  taxRate: number;
  onTaxRateChange: (rate: string) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin: () => number;
  calculateMarginPercentage: () => number;
}

export const EstimateSummary = ({
  taxRate,
  onTaxRateChange,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage
}: EstimateSummaryProps) => {
  
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTaxRateChange(e.target.value);
  };

  return (
    <div className="border rounded-md p-6 bg-card">
      <h3 className="font-semibold text-lg mb-4">Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Tax:</span>
            <div className="relative w-16">
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={handleTaxRateChange}
                className="h-7 px-2 py-1 text-right pr-5"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">%</span>
            </div>
          </div>
          <span>${calculateTotalTax().toFixed(2)}</span>
        </div>
        
        <div className="pt-3 border-t">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>${calculateGrandTotal().toFixed(2)}</span>
          </div>
        </div>
        
        {/* Profit margin - visible only to staff */}
        <div className="mt-4 pt-4 border-t border-dashed">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-green-600">
              <span className="font-medium">Profit Margin</span>
              <span className="tooltip-container">
                <Info size={14} className="text-muted-foreground" />
                <span className="tooltip-text text-xs bg-background border p-2 rounded shadow-md absolute -top-10 left-0 hidden group-hover:block w-48">
                  This information is for internal use only
                </span>
              </span>
            </div>
            <span className="text-green-600 font-medium">
              ${calculateTotalMargin().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-muted-foreground">Percentage:</span>
            <span className="text-sm text-green-600">
              {calculateMarginPercentage().toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This information is for internal use only
          </p>
        </div>
      </div>
    </div>
  );
};
