
export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
  reference?: string;
  status?: string;
  client_id?: string;
  clientId?: string; // For compatibility
  clientName?: string; // For display purposes
  job_id?: string;
  jobId?: string; // For compatibility
  job_title?: string;
  invoice_number?: string;
  technician_id?: string;
  technician_name?: string;
  created_at: string;
}

export interface PaymentInput {
  amount: number;
  method: string;
  date: string;
  notes?: string;
}

export type PaymentMethod = 'credit-card' | 'cash' | 'cheque' | 'e-transfer';
export type PaymentStatus = 'paid' | 'refunded' | 'disputed' | 'pending';
