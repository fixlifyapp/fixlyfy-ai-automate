
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

// This type defines what parameters are expected by the update_team_member_commission RPC function
export interface UpdateTeamMemberCommissionParams {
  p_user_id: string;
  p_base_rate: number;
  p_rules: any[];
  p_fees: any[];
}

// Define database functions for TypeScript type safety
export type DatabaseFunctions = 
  | "get_team_member_commission" 
  | "get_team_member_skills" 
  | "get_service_areas"
  | "update_team_member_commission";

// This interface defines the business metrics structure that will be returned from the AI assistant API
export interface BusinessMetrics {
  metrics: {
    clients: {
      total: number;
      active: number;
      newLastMonth: number;
    };
    jobs: {
      total: number;
      completed: number;
      inProgress: number;
      scheduled: number;
      lastUpdated?: string; // Made optional with ? since it might not always be present
    };
    revenue: {
      total: number;
      average: number;
    };
    services: {
      topService: string;
      distribution: Record<string, number>;
    };
    technicians: {
      performance: Record<string, { jobs: number; completed: number }>;
      topPerformer: string;
    };
  };
  period: string;
  refreshCycle: string;
  lastRefreshed: string;
}

// Interface for AI response from the edge function
export interface AIResponse {
  generatedText: string;
  businessData: BusinessMetrics | null;
  model: string;
  lastRefreshed: string;
  refreshCycle: string;
}
