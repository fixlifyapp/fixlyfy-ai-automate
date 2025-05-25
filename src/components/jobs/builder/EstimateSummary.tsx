
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EstimateSummaryProps {
  estimateNumber: string;
  lineItems: any[];
  notes: string;
  taxRate: number;
  onNotesChange: (notes: string) => void;
  onTaxRateChange: (rate: number) => void;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  totalMargin?: number;
  marginPercentage?: number;
  companyInfo?: any;
  clientInfo?: any;
  jobInfo?: any;
}

export const EstimateSummary = ({
  estimateNumber,
  notes,
  taxRate,
  onNotesChange,
  onTaxRateChange,
  subtotal,
  totalTax,
  grandTotal,
  totalMargin,
  marginPercentage,
}: EstimateSummaryProps) => {
  return (
    <div className="space-y-4">
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-4">Estimate Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="tax-rate" className="text-muted-foreground">Tax Rate:</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => onTaxRateChange(Number(e.target.value))}
                className="w-16 h-8"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <span className="font-medium">${totalTax.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${grandTotal.toFixed(2)}</span>
          </div>
          
          {totalMargin !== undefined && marginPercentage !== undefined && (
            <div className="border-t pt-4 flex justify-between items-center text-sm text-green-600">
              <span className="font-medium">Margin:</span>
              <span className="font-medium">${totalMargin.toFixed(2)} ({marginPercentage.toFixed(1)}%)</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any notes for this estimate..."
          rows={4}
        />
      </div>
    </div>
  );
};
