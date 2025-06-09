
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useJobFinancials = (jobId: string) => {
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchFinancials = async () => {
      try {
        console.log('Fetching financials for job:', jobId);

        // Fetch invoices with their payments for this job
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select(`
            *,
            payments(amount)
          `)
          .eq('job_id', jobId);

        if (invoicesError) {
          console.error('Error fetching invoices:', invoicesError);
          setIsLoading(false);
          return;
        }

        console.log('Fetched invoices with payments:', invoices);

        // Calculate totals with proper payment linking
        const totalInvoiced = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
        
        // Calculate total paid from actual payment records
        const totalPaidAmount = invoices?.reduce((sum, invoice) => {
          const invoicePayments = invoice.payments || [];
          const invoicePaid = invoicePayments.reduce((paySum: number, payment: any) => paySum + (payment.amount || 0), 0);
          return sum + invoicePaid;
        }, 0) || 0;

        const totalBalance = totalInvoiced - totalPaidAmount;

        // Count paid and unpaid invoices based on actual payment status
        const paidCount = invoices?.filter(invoice => {
          const invoicePayments = invoice.payments || [];
          const invoicePaid = invoicePayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          return invoicePaid >= (invoice.total || 0);
        }).length || 0;
        
        const unpaidCount = invoices?.filter(invoice => {
          const invoicePayments = invoice.payments || [];
          const invoicePaid = invoicePayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          return invoicePaid < (invoice.total || 0);
        }).length || 0;

        // Calculate overdue amount (invoices past due date with remaining balance)
        const now = new Date();
        const overdueTotal = invoices?.reduce((sum, invoice) => {
          const invoicePayments = invoice.payments || [];
          const invoicePaid = invoicePayments.reduce((paySum: number, payment: any) => paySum + (payment.amount || 0), 0);
          const remainingBalance = (invoice.total || 0) - invoicePaid;
          
          if (remainingBalance > 0 && invoice.due_date && new Date(invoice.due_date) < now) {
            return sum + remainingBalance;
          }
          return sum;
        }, 0) || 0;

        setInvoiceAmount(totalInvoiced);
        setTotalPaid(totalPaidAmount);
        setBalance(totalBalance);
        setOverdueAmount(overdueTotal);
        setPaidInvoices(paidCount);
        setUnpaidInvoices(unpaidCount);

        console.log('Calculated financials:', {
          invoiceAmount: totalInvoiced,
          totalPaid: totalPaidAmount,
          balance: totalBalance,
          overdueAmount: overdueTotal,
          paidInvoices: paidCount,
          unpaidInvoices: unpaidCount
        });

      } catch (error) {
        console.error('Error fetching job financials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancials();

    // Set up optimized real-time updates with debouncing
    let timeoutId: NodeJS.Timeout;
    
    const debouncedRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Real-time update detected, refetching financials...');
        fetchFinancials();
      }, 500); // 500ms debounce
    };

    const channel = supabase
      .channel(`job-financials-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `job_id=eq.${jobId}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        debouncedRefresh
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  return {
    invoiceAmount,
    balance,
    totalPaid,
    overdueAmount,
    paidInvoices,
    unpaidInvoices,
    isLoading
  };
};
