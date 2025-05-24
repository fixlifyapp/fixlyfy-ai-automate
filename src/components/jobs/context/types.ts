
export interface JobInfo {
  id: string;
  clientId: string;
  client: string;
  service: string;
  address: string;
  phone: string;
  email: string;
  total: number;
  status?: string;
  description?: string;
  title?: string;
  scheduledDate?: string;
  priority?: string;
}

export interface JobDetailsContextType {
  job: JobInfo | null;
  isLoading: boolean;
  currentStatus: string;
  invoiceAmount: number;
  balance: number;
  refreshJob: () => void;
  updateJobStatus: (newStatus: string) => Promise<void>;
}
