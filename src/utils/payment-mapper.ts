
import { Payment as PaymentType } from "@/types/payment";
import { Payment as PaymentHookType } from "@/hooks/usePayments";

/**
 * Maps Payment objects from the usePayments hook to the type expected by the Finance page
 */
export function mapPaymentFromHook(payment: PaymentHookType): PaymentType {
  return {
    id: payment.id,
    date: payment.date || payment.created_at,
    clientId: payment.client_id || "",
    clientName: "", // Will be filled in if available
    jobId: payment.job_id || "",
    amount: payment.amount,
    method: payment.method,
    status: payment.status as any,
    reference: payment.reference,
    notes: payment.notes,
    technicianId: payment.technician_id,
    technicianName: payment.technician_name
  };
}
