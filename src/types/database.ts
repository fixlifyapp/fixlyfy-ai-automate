
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
  user_id: string;
  name: string;
  created_at: string;
}

export interface ServiceArea {
  id: string;
  user_id: string;
  name: string;
  zip_code?: string;
  created_at: string;
}
