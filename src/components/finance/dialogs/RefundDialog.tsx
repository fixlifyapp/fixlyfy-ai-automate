
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id?: string;
    amount?: number;
    client_name?: string;
    payment_method?: string;
  };
  onRefund: (refundData: any) => void;
}

export const RefundDialog = ({
  open,
  onOpenChange,
  payment,
  onRefund
}: RefundDialogProps) => {
  const [refundAmount, setRefundAmount] = useState(payment.amount || 0);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefund = async () => {
    if (!refundAmount || refundAmount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (refundAmount > (payment.amount || 0)) {
      toast.error("Refund amount cannot exceed the original payment amount");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Mock refund processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const refundData = {
        payment_id: payment.id,
        amount: refundAmount,
        reason,
        refund_date: new Date().toISOString()
      };
      
      onRefund(refundData);
      toast.success(`Refund of $${refundAmount.toFixed(2)} processed successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
            Process Refund
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Refund Warning</p>
                <p className="text-yellow-700">This action cannot be undone. Please verify the refund amount before proceeding.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Client:</span>
              <p className="font-medium">{payment.client_name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-500">Payment Method:</span>
              <p className="font-medium">{payment.payment_method || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-500">Original Amount:</span>
              <p className="font-medium">{formatCurrency(payment.amount || 0)}</p>
            </div>
            <div>
              <span className="text-gray-500">Payment ID:</span>
              <p className="font-medium text-xs">{payment.id || 'N/A'}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="refund-amount">Refund Amount</Label>
            <Input
              id="refund-amount"
              type="number"
              step="0.01"
              min="0"
              max={payment.amount || 0}
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="refund-reason">Reason for Refund</Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for the refund..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700">
            {isProcessing ? "Processing..." : `Refund ${formatCurrency(refundAmount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
