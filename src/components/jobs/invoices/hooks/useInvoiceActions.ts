
import { useState } from 'react';
import { toast } from 'sonner';

// Local Invoice interface
interface Invoice {
  id: string;
  invoice_number: string;
  job_id: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
  items?: any[];
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
      // Mock implementation - update local state
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
      // Mock implementation - update local state
      setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
      
      toast.success('Invoice deleted successfully');
      setSelectedInvoice(null);
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

      // Mock implementation - update local state
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
