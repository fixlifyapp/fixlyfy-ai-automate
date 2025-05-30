
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

        // Fetch invoices for this job
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('job_id', jobId);

        if (invoicesError) {
          console.error('Error fetching invoices:', invoicesError);
          setIsLoading(false);
          return;
        }

        console.log('Fetched invoices:', invoices);

        // Calculate totals
        const totalInvoiced = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
        const totalPaidAmount = invoices?.reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0) || 0;
        const totalBalance = totalInvoiced - totalPaidAmount;

        // Count paid and unpaid invoices
        const paidCount = invoices?.filter(invoice => invoice.status === 'paid').length || 0;
        const unpaidCount = invoices?.filter(invoice => invoice.status !== 'paid').length || 0;

        // Calculate overdue amount (simplified - invoices past due date)
        const now = new Date();
        const overdueTotal = invoices?.reduce((sum, invoice) => {
          if (invoice.status !== 'paid' && invoice.due_date && new Date(invoice.due_date) < now) {
            return sum + ((invoice.total || 0) - (invoice.amount_paid || 0));
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

    // Set up real-time updates for invoices and payments
    const channel = supabase
      .channel('job-financials')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `job_id=eq.${jobId}`
        },
        () => {
          console.log('Invoice update detected, refetching financials...');
          fetchFinancials();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          console.log('Payment update detected, refetching financials...');
          fetchFinancials();
        }
      )
      .subscribe();

    return () => {
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
