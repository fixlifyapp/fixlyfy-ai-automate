
// Job overview specific types to avoid interface mismatches
export interface JobInfo {
  id: string;
  client_id: string;
  clientId?: string;
  title?: string;
  description?: string;
  service?: string;
  status: string;
  tags?: string[];
  notes?: string;
  job_type?: string;
  lead_source?: string;
  address?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  revenue?: number;
  technician_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tasks?: string[];
  property_id?: string;
  
  // Client information
  client?: string;
  phone?: string;
  email?: string;
  total?: number;
}
