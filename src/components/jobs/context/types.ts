
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
  tags?: string[];
  technician_id?: string;
  schedule_start?: string;
  schedule_end?: string;
  job_type?: string;
  lead_source?: string;
  tasks?: string[];
  date?: string;
  custom_fields?: Array<{
    id: string;
    name: string;
    value: string;
    field_type: string;
  }>;
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
