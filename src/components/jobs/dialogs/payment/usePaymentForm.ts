
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
    
    // Validate input
    if (!amount || amount.trim() === "") {
      toast.error("Please enter a payment amount");
      return;
    }

    const paymentAmount = parseFloat(amount);
    
    // Check if amount is valid number
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    // Round the payment amount to avoid floating point issues
    const roundedPaymentAmount = roundToCurrency(paymentAmount);
    
    // Use a small tolerance for floating-point comparison (1 cent)
    const tolerance = 0.01;
    if (roundedPaymentAmount > (maxPayment + tolerance)) {
      toast.error(`Payment amount cannot exceed remaining balance of $${maxPayment.toFixed(2)}`);
      return;
    }

    // Validate invoice ID
    if (!invoice.id) {
      toast.error("Invalid invoice - missing ID");
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
    }, 15000); // 15 second timeout

    try {
      console.log('Submitting payment for invoice:', invoice.id, 'amount:', roundedPaymentAmount, 'job:', jobId);
      
      const success = await addPayment({
        invoiceId: invoice.id,
        amount: roundedPaymentAmount,
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
      } else {
        // addPayment already shows error toast
        console.error('Payment recording failed');
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
