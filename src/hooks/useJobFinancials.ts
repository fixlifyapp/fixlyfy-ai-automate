
import { useState, useEffect } from 'react';
import { useInvoices } from './useInvoices';
import { usePayments } from './usePayments';
import { supabase } from '@/integrations/supabase/client';
import { roundToCurrency } from '@/lib/utils';

export const useJobFinancials = (jobId: string) => {
  const { invoices, isLoading: invoicesLoading, refreshInvoices } = useInvoices(jobId);
  const { payments, isLoading: paymentsLoading, refreshPayments } = usePayments(jobId);
  const [totals, setTotals] = useState({
    invoiceAmount: 0,
    balance: 0,
    totalPaid: 0,
    overdueAmount: 0,
    paidInvoices: 0,
    unpaidInvoices: 0
  });

  // Set up real-time subscriptions for invoices and payments
  useEffect(() => {
    if (!jobId) return;

    const invoicesChannel = supabase
      .channel('job-invoices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `job_id=eq.${jobId}`
        },
        () => {
          console.log('Invoice update detected, refreshing...');
          refreshInvoices();
        }
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel('job-payments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          console.log('Payment update detected, refreshing...');
          refreshPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [jobId, refreshInvoices, refreshPayments]);

  // Calculate totals when data changes
  useEffect(() => {
    if (!invoicesLoading && !paymentsLoading) {
      console.log('Calculating financials for job:', jobId);
      console.log('Invoices:', invoices);
      console.log('Payments:', payments);

      // Calculate invoice totals with proper rounding
      const invoiceTotal = roundToCurrency(invoices.reduce((sum, invoice) => {
        return sum + (invoice.total || 0);
      }, 0));

      // Calculate total paid amount from payments with proper rounding
      const paidTotal = roundToCurrency(payments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0));

      // Calculate balance with proper rounding to prevent floating-point precision issues
      const balanceAmount = roundToCurrency(invoiceTotal - paidTotal);

      // Calculate overdue amount with proper rounding
      const currentDate = new Date();
      const overdueAmount = roundToCurrency(invoices
        .filter(invoice => 
          invoice.due_date && 
          new Date(invoice.due_date) < currentDate && 
          invoice.status !== 'paid'
        )
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0));

      // Count paid and unpaid invoices
      const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
      const unpaidInvoices = invoices.filter(invoice => invoice.status !== 'paid').length;

      const newTotals = {
        invoiceAmount: invoiceTotal,
        totalPaid: paidTotal,
        balance: Math.max(0, balanceAmount), // Ensure balance is never negative
        overdueAmount,
        paidInvoices,
        unpaidInvoices
      };

      console.log('Calculated totals:', newTotals);
      setTotals(newTotals);
    }
  }, [invoices, payments, invoicesLoading, paymentsLoading, jobId]);

  return {
    ...totals,
    isLoading: invoicesLoading || paymentsLoading,
    refresh: () => {
      refreshInvoices();
      refreshPayments();
    }
  };
};
