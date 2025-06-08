
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentTotalsSectionProps {
  documentType: "estimate" | "invoice";
  taxRate: number;
  onTaxRateChange?: (rate: number) => void;
  subtotal: number;
  tax: number;
  total: number;
}

export const DocumentTotalsSection = ({
  documentType,
  taxRate,
  onTaxRateChange,
  subtotal,
  tax,
  total
}: DocumentTotalsSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className={isMobile ? 'px-3 py-3' : 'px-6 py-4'}>
        <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
          {documentType === "estimate" ? "Estimate" : "Invoice"} Summary
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-3 pb-3' : 'px-6 pb-6'}>
        <div className={`space-y-3 ${isMobile ? 'text-sm' : ''}`}>
          {/* Tax Rate Input */}
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}>
            <Label htmlFor="taxRate" className={isMobile ? 'text-sm' : ''}>
              Tax Rate (%)
            </Label>
            <div className={isMobile ? 'w-full' : 'w-24'}>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange?.(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.25"
                className={`text-right ${isMobile ? 'h-10' : 'h-8'}`}
              />
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className={`font-medium ${isMobile ? 'text-base' : ''}`}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Tax ({taxRate}%):
              </span>
              <span className={`font-medium ${isMobile ? 'text-base' : ''}`}>
                ${tax.toFixed(2)}
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                Total:
              </span>
              <span className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
