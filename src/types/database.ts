
/**
 * Custom type definitions for Supabase database tables
 * These types supplement the auto-generated types from Supabase
 */
export interface TeamMemberCommission {
  id: string;
  user_id: string;
  base_rate: number;
  rules: any[];
  fees: any[];
  created_at: string;
  updated_at: string;
}

export interface TeamMemberSkill {
  id: string;
  name: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_code?: string;
}

export interface ProfileRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  business_niche: string | null;
  call_masking_enabled: boolean | null;
  created_at: string | null;
  internal_notes: string | null;
  is_public: boolean | null;
  labor_cost_per_hour: number | null;
  phone: string | null;
  referral_source: string | null;
  role: string | null;
  schedule_color: string | null;
  status: string | null;
  two_factor_enabled: boolean | null;
  updated_at: string | null;
  uses_two_factor: boolean | null;
  available_for_jobs: boolean | null;
}
