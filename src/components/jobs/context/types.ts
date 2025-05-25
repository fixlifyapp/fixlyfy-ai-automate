
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
  priority?: string;
  lead_source?: string;
  estimated_duration?: number;
  special_instructions?: string;
  client_requirements?: string;
  access_instructions?: string;
  preferred_time?: string;
  equipment_needed?: string[];
  safety_notes?: string;
  tasks?: string[];
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
