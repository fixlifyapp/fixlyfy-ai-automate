
import { useState, useEffect } from 'react';
import { useInvoices } from './useInvoices';
import { usePayments } from './usePayments';

export const useJobFinancials = (jobId: string) => {
  const { invoices, isLoading: invoicesLoading } = useInvoices(jobId);
  const { payments, isLoading: paymentsLoading } = usePayments(jobId);
  const [totals, setTotals] = useState({
    invoiceAmount: 0,
    balance: 0,
    totalPaid: 0
  });

  useEffect(() => {
    if (!invoicesLoading && !paymentsLoading) {
      const invoiceTotal = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      const paidTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const balanceAmount = invoiceTotal - paidTotal;

      setTotals({
        invoiceAmount: invoiceTotal,
        totalPaid: paidTotal,
        balance: balanceAmount
      });
    }
  }, [invoices, payments, invoicesLoading, paymentsLoading]);

  return {
    ...totals,
    isLoading: invoicesLoading || paymentsLoading
  };
};
