
export interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  client_id?: string;
  technician_id?: string;
  property_id?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  schedule_start?: string;
  schedule_end?: string;
  service?: string;
  job_type?: string;
  lead_source?: string;
  notes?: string;
  tags?: string[];
  tasks?: any[];
  revenue?: number;
  created_by?: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  estimates?: Array<{
    id: string;
    total_amount?: number;
  }>;
  invoices?: Array<{
    id: string;
    total_amount?: number;
  }>;
  custom_fields?: Array<{
    id: string;
    name: string;
    value?: string;
  }>;
}
