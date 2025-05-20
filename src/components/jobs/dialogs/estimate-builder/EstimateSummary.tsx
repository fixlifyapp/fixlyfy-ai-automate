
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EstimateSummaryProps {
  taxRate: number;
  onTaxRateChange: (rate: string) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  // Add the missing properties
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
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
  const subtotal = calculateSubtotal();
  const taxTotal = calculateTotalTax();
  const grandTotal = calculateGrandTotal();
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-medium">Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="tax-rate" className="text-sm text-muted-foreground">Tax Rate:</Label>
            <div className="relative w-20">
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => onTaxRateChange(e.target.value)}
                className="pl-2 pr-6 h-7 text-right"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">%</span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span>${taxTotal.toFixed(2)}</span>
          </div>
          
          <div className="h-px bg-muted my-2"></div>
          
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
