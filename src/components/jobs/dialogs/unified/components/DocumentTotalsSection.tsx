
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
