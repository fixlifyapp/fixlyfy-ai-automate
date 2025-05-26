
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  job_id: string;
  invoice_number: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  date: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceActionsState {
  selectedInvoice: Invoice | null;
  isDeleting: boolean;
  isSending: boolean;
  isProcessing: boolean;
}

export interface InvoiceActionsActions {
  setSelectedInvoice: (invoice: Invoice | null) => void;
  handleSendInvoice: (invoiceId: string) => Promise<boolean>;
  confirmDeleteInvoice: () => Promise<boolean>;
  markAsPaid: (invoiceId: string, amount?: number) => Promise<boolean>;
}

export const useInvoiceActions = (
  jobId: string,
  invoices: Invoice[],
  setInvoices: (invoices: Invoice[]) => void,
  refreshInvoices: () => void
) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendInvoice = async (invoiceId: string): Promise<boolean> => {
    setIsSending(true);
    try {
      // Update invoice status to 'sent' in database
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId);

      if (error) throw error;

      // Update local state optimistically
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'sent' } : inv
      ));
      
      toast.success('Invoice sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const confirmDeleteInvoice = async (): Promise<boolean> => {
    if (!selectedInvoice) return false;
    
    setIsDeleting(true);
    try {
      // Delete related payments first
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('invoice_id', selectedInvoice.id);

      if (paymentsError) {
        console.warn('Error deleting payments:', paymentsError);
      }

      // Delete related line items
      const { error: lineItemsError } = await supabase
        .from('line_items')
        .delete()
        .eq('parent_type', 'invoice')
        .eq('parent_id', selectedInvoice.id);

      if (lineItemsError) {
        console.warn('Error deleting line items:', lineItemsError);
      }

      // Delete the invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', selectedInvoice.id);

      if (error) throw error;
      
      // Update local state optimistically
      setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
      
      toast.success('Invoice deleted successfully');
      setSelectedInvoice(null);
      
      // Refresh invoices to ensure consistency
      refreshInvoices();
      
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const markAsPaid = async (invoiceId: string, amount?: number): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      const paymentAmount = amount || invoice.balance;
      const newAmountPaid = invoice.amount_paid + paymentAmount;
      const newBalance = invoice.total - newAmountPaid;
      const newStatus = newBalance <= 0 ? 'paid' : 'partial';

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          amount: paymentAmount,
          method: 'manual',
          date: new Date().toISOString(),
          notes: 'Manual payment entry'
        });

      if (paymentError) throw paymentError;

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      // Update local state optimistically
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId 
          ? { 
              ...inv, 
              amount_paid: newAmountPaid, 
              balance: newBalance,
              status: newStatus
            } 
          : inv
      ));
      
      toast.success('Payment recorded successfully');
      return true;
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    state: {
      selectedInvoice,
      isDeleting,
      isSending,
      isProcessing
    },
    actions: {
      setSelectedInvoice,
      handleSendInvoice,
      confirmDeleteInvoice,
      markAsPaid
    }
  };
};
