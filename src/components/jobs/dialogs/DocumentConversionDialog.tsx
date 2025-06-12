
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  DollarSign, 
  ArrowRight, 
  Calendar,
  CreditCard,
  Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDocument: {
    id: string;
    number: string;
    type: "estimate" | "invoice";
    total: number;
    lineItems: any[];
    client: string;
    jobId: string;
  };
  onConvert: (data: any) => Promise<void>;
}

export const DocumentConversionDialog = ({
  open,
  onOpenChange,
  sourceDocument,
  onConvert
}: DocumentConversionDialogProps) => {
  const [isConverting, setIsConverting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordPayment, setRecordPayment] = useState(false);

  const targetType = sourceDocument.type === "estimate" ? "invoice" : "estimate";

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const conversionData = {
        sourceId: sourceDocument.id,
        targetType,
        lineItems: sourceDocument.lineItems,
        payment: recordPayment ? {
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          notes: paymentNotes
        } : null
      };

      await onConvert(conversionData);
      
      toast.success(`${sourceDocument.type} converted to ${targetType} successfully!`);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert document");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Convert {sourceDocument.type === "estimate" ? "Estimate" : "Invoice"}
            <ArrowRight className="h-4 w-4" />
            {targetType === "estimate" ? "Estimate" : "Invoice"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Document Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">Source Document</span>
                </div>
                <Badge variant="outline">{sourceDocument.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Number</p>
                  <p className="font-semibold">{sourceDocument.number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-semibold">{sourceDocument.client}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">{formatCurrency(sourceDocument.total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Line Items</p>
                  <p className="font-semibold">{sourceDocument.lineItems.length} items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Details */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Conversion Details</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm">All line items and warranty selections will be copied</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm">New {targetType} number will be auto-generated</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Original {sourceDocument.type} will be marked as converted</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Recording (for invoice conversions) */}
          {targetType === "invoice" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-semibold">Record Payment (Optional)</span>
                  </div>
                  <Button
                    variant={recordPayment ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecordPayment(!recordPayment)}
                  >
                    {recordPayment ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardHeader>
              {recordPayment && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Payment Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        max={sourceDocument.total}
                      />
                    </div>
                    <div>
                      <Label htmlFor="method">Payment Method</Label>
                      <select
                        id="method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md"
                      >
                        <option value="cash">Cash</option>
                        <option value="credit">Credit Card</option>
                        <option value="check">Check</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Payment Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Optional payment notes..."
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvert} disabled={isConverting}>
              {isConverting ? "Converting..." : `Convert to ${targetType}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
