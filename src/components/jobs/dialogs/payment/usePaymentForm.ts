
import { useState, useRef } from "react";
import { toast } from "sonner";
import { usePaymentActions } from "@/hooks/usePaymentActions";
import { roundToCurrency } from "@/lib/utils";

interface UsePaymentFormProps {
  invoice: {
    id: string;
    total: number;
    amount_paid?: number;
    balance?: number;
  };
  jobId: string;
  onPaymentAdded?: () => void;
  onClose: () => void;
}

export const usePaymentForm = ({ invoice, jobId, onPaymentAdded, onClose }: UsePaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addPayment, isProcessing } = usePaymentActions(jobId, () => {
    console.log('Payment action completed, triggering refresh');
    if (onPaymentAdded) {
      onPaymentAdded();
    }
  });

  // Use proper currency rounding for all calculations
  const remainingBalance = roundToCurrency(
    invoice.balance ?? (invoice.total - (invoice.amount_paid ?? 0))
  );
  const maxPayment = Math.max(0, remainingBalance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting || isProcessing) {
      console.log('Payment submission already in progress, ignoring duplicate click');
      return;
    }
    
    const paymentAmount = roundToCurrency(parseFloat(amount));
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    // Use a small tolerance for floating-point comparison (1 cent)
    const tolerance = 0.01;
    if (paymentAmount > (maxPayment + tolerance)) {
      toast.error(`Payment amount cannot exceed remaining balance of $${maxPayment.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    
    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    
    // Set a timeout to reset submitting state in case of unexpected errors
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
    }, 10000); // 10 second timeout

    try {
      console.log('Submitting payment for invoice:', invoice.id, 'amount:', paymentAmount, 'job:', jobId);
      
      const success = await addPayment({
        invoiceId: invoice.id,
        amount: paymentAmount,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (success) {
        console.log('Payment recorded successfully, closing dialog and refreshing');
        
        // Reset form first
        setAmount("");
        setMethod("cash");
        setReference("");
        setNotes("");
        
        // Close dialog immediately
        onClose();
        
        // Show success message
        toast.success("Payment recorded successfully!");
        
        // Small delay to ensure dialog closes before refresh
        setTimeout(() => {
          if (onPaymentAdded) {
            console.log('Triggering payment refresh callback');
            onPaymentAdded();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    }
  };

  const resetForm = () => {
    setAmount("");
    setMethod("cash");
    setReference("");
    setNotes("");
  };

  return {
    amount,
    setAmount,
    method,
    setMethod,
    reference,
    setReference,
    notes,
    setNotes,
    isSubmitting,
    isProcessing,
    remainingBalance,
    maxPayment,
    handleSubmit,
    resetForm
  };
};
