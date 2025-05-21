
import { PaymentMethod } from "@/types/payment";

// Define a proper type for payments
export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  created_at: string;
  notes: string;
  reference: string;
  invoice_id: string;
  job_id?: string;
  client_id?: string;
  status: string;
  technician_id?: string;
  technician_name?: string;
}

export type PaymentInput = {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
};
