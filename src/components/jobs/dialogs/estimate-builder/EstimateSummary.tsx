
import { Input } from "@/components/ui/input";

interface EstimateSummaryProps {
  taxRate: number;
  onTaxRateChange?: (value: string) => void;
  calculateSubtotal?: () => number;
  calculateTotalTax?: () => number;
  calculateGrandTotal?: () => number;
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
}

export const EstimateSummary = ({
  taxRate = 13, // Default to 13%
  onTaxRateChange,
  calculateSubtotal = () => 0,
  calculateTotalTax = () => 0,
  calculateGrandTotal = () => 0,
  calculateTotalMargin,
  calculateMarginPercentage
}: EstimateSummaryProps) => {
  const subtotal = typeof calculateSubtotal === 'function' ? calculateSubtotal() : 0;
  const totalTax = typeof calculateTotalTax === 'function' ? calculateTotalTax() : 0;
  const grandTotal = typeof calculateGrandTotal === 'function' ? calculateGrandTotal() : 0;
  
  const showMargin = !!calculateTotalMargin && !!calculateMarginPercentage;
  const totalMargin = showMargin && typeof calculateTotalMargin === 'function' ? calculateTotalMargin() : 0;
  const marginPercentage = showMargin && typeof calculateMarginPercentage === 'function' ? calculateMarginPercentage() : 0;
  
  return (
    <div className="border p-4 rounded-md">
      <h3 className="font-semibold mb-4">Estimate Summary</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Tax Rate:</span>
            <span className="font-medium">13%</span>
          </div>
          <span className="font-medium">${totalTax.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">${grandTotal.toFixed(2)}</span>
        </div>
        
        {showMargin && (
          <>
            <div className="border-t pt-4 flex justify-between items-center text-sm text-green-600">
              <span className="font-medium">Margin:</span>
              <span className="font-medium">${totalMargin.toFixed(2)} ({marginPercentage.toFixed(1)}%)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
