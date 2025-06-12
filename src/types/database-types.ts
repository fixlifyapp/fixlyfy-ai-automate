
// Unified database types that match Supabase schema exactly
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface DbClient {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  type?: string | null;
  status?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DbJob {
  id: string;
  client_id: string | null;
  title?: string | null;
  description?: string | null;
  service?: string | null;
  status?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  job_type?: string | null;
  lead_source?: string | null;
  address?: string | null;
  date?: string | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  revenue?: number | null;
  technician_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  tasks?: Json[] | null;
  property_id?: string | null;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
  ourPrice?: number;
  unit?: string;
  category?: string;
  name?: string;
  price?: number;
  discount?: number;
}

export interface DbEstimate {
  id: string;
  job_id: string;
  estimate_number: string;
  client_id?: string | null;
  total: number;
  subtotal: number;
  tax_amount?: number | null;
  tax_rate?: number | null;
  discount_amount?: number | null;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted' | 'expired';
  items?: Json | null;
  notes?: string | null;
  terms?: string | null;
  description?: string | null;
  title?: string | null;
  valid_until?: string | null;
  sent_at?: string | null;
  approved_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInvoice {
  id: string;
  job_id: string;
  invoice_number: string;
  client_id?: string | null;
  estimate_id?: string | null;
  total: number;
  subtotal: number;
  tax_amount?: number | null;
  tax_rate?: number | null;
  discount_amount?: number | null;
  amount_paid?: number | null;
  balance?: number | null;
  balance_due?: number | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial' | 'unpaid' | 'cancelled';
  items?: Json | null;
  notes?: string | null;
  terms?: string | null;
  description?: string | null;
  title?: string | null;
  issue_date: string;
  due_date?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  date?: string | null;
}

// Type guards for Json field casting
export function isStringArray(value: Json): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export function isLineItemArray(value: Json): value is LineItem[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'description' in item && 
    'quantity' in item && 
    'unitPrice' in item
  );
}

// Safe extractors for Json fields
export function extractLineItems(items: Json | null): LineItem[] {
  if (!items) return [];
  if (isLineItemArray(items)) return items;
  return [];
}

export function extractStringArray(value: Json | null): string[] {
  if (!value) return [];
  if (isStringArray(value)) return value;
  return [];
}

// Client type extraction helper
export function extractClientInfo(client: string | DbClient | null): {
  id: string;
  name: string;
  email?: string;
  phone?: string;
} | null {
  if (!client) return null;
  
  if (typeof client === 'string') {
    return {
      id: client,
      name: client,
      email: undefined,
      phone: undefined
    };
  }
  
  return {
    id: client.id,
    name: client.name,
    email: client.email || undefined,
    phone: client.phone || undefined
  };
}

// Unified Document interface for estimates/invoices
export interface UnifiedDocument {
  id: string;
  number: string;
  job_id: string;
  client_id?: string | null;
  total: number;
  subtotal: number;
  tax_amount?: number | null;
  tax_rate?: number | null;
  status: string;
  items: LineItem[];
  notes?: string | null;
  created_at: string;
  updated_at: string;
  date: string;
  amount?: number; // For compatibility
}
