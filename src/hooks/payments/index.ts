
import { useFetchPayments } from "./useFetchPayments";
import { usePaymentCalculations } from "./usePaymentCalculations";
import { usePaymentActions } from "./usePaymentActions";
import { Payment, PaymentInput } from "./types";

// Re-export types
export type { Payment, PaymentInput };

// Enhanced version of usePayments
export const usePayments = (jobId?: string) => {
  const { payments, setPayments, isLoading, fetchPayments } = useFetchPayments(jobId);
  const { totalPaid, totalRefunded, netAmount } = usePaymentCalculations(payments);
  const { addPayment, refundPayment, deletePayment } = usePaymentActions(jobId, setPayments);
  
  return {
    payments,
    isLoading,
    error: null,
    totalPaid,
    totalRefunded,
    netAmount,
    addPayment,
    refundPayment,
    deletePayment,
    fetchPayments
  };
};
