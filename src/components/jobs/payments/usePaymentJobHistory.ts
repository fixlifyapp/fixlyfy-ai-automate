
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/hooks/payments";
import { recordPayment } from "@/services/jobHistoryService";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useCallback } from "react";

export const usePaymentJobHistory = (jobId: string) => {
  const { currentUser } = useRBAC();

  const recordRefund = useCallback(async (payment: Payment) => {
    try {
      // Add a history item for the refund
      await supabase
        .from('job_history')
        .insert({
          job_id: jobId,
          type: 'payment',
          title: 'Payment Refunded',
          description: `Payment of $${payment.amount.toFixed(2)} via ${payment.method} was refunded`,
          user_id: currentUser?.id,
          user_name: currentUser?.name,
          meta: {
            amount: payment.amount,
            method: payment.method,
            reference: payment.reference,
            refunded: true
          },
          visibility: 'restricted'
        });
    } catch (error) {
      console.error('Error recording refund in history:', error);
    }
  }, [jobId, currentUser]);
  
  const recordNewPayment = useCallback(async (
    amount: number,
    method: string,
    reference?: string
  ) => {
    try {
      await recordPayment(
        jobId,
        amount,
        method,
        currentUser?.name,
        currentUser?.id,
        reference
      );
      return true;
    } catch (error) {
      console.error('Error recording payment in history:', error);
      return false;
    }
  }, [jobId, currentUser]);
  
  return {
    recordRefund,
    recordNewPayment
  };
};
