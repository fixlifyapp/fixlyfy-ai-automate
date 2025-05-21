
import { useMemo } from "react";
import { Payment } from "./types";

export const usePaymentCalculations = (payments: Payment[]) => {
  // Calculate payment totals
  const totalPaid = useMemo(() => {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const totalRefunded = useMemo(() => {
    return payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const netAmount = useMemo(() => {
    return totalPaid - totalRefunded;
  }, [totalPaid, totalRefunded]);

  return {
    totalPaid,
    totalRefunded,
    netAmount
  };
};
