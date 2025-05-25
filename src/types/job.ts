
export interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  client_id?: string;
  technician_id?: string;
  property_id?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  created_at?: string;
  updated_at?: string;
  revenue?: number;
  tags?: string[];
  notes?: string;
  job_type?: string;
  lead_source?: string;
  service?: string;
  tasks: string[] | string;
  custom_fields?: Array<{
    id: string;
    name: string;
    value?: string;
  }>;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  estimates?: Array<{
    id: string;
    total: number;
  }>;
  invoices?: Array<{
    id: string;
    total: number;
  }>;
  created_by?: string;
}
