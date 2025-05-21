
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Payment } from "@/hooks/payments";

interface PaymentActionsProps {
  payment: Payment;
  onRefund: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export const PaymentActions = ({ payment, onRefund, onDelete }: PaymentActionsProps) => {
  return (
    <>
      {payment.status === 'paid' && (
        <Button
          onClick={() => onRefund(payment)}
          size="sm"
          variant="outline"
          className="h-8 text-amber-600 mr-1 border-amber-200 hover:bg-amber-50"
        >
          Refund
        </Button>
      )}
      <Button
        onClick={() => onDelete(payment)}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 size={16} />
        <span className="sr-only">Delete payment</span>
      </Button>
    </>
  );
};
