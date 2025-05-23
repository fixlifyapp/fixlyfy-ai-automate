
// Add any types related to your database here

// Define a list of valid Database functions
export type DatabaseFunctions = 
  | "get_team_member_commission" 
  | "get_team_member_skills" 
  | "get_service_areas"
  | "update_team_member_commission";

// Add missing type definitions
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
  zip_code: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  status: string;
  updated_at?: string;
  is_public?: boolean;
  available_for_jobs?: boolean;
  two_factor_enabled?: boolean;
  call_masking_enabled?: boolean;
  labor_cost_per_hour?: number;
  schedule_color?: string;
  internal_notes?: string;
  uses_two_factor?: boolean;
}

export interface UpdateTeamMemberCommissionParams {
  user_id: string;
  base_rate: number;
  rules: any[];
  fees: any[];
}

export interface AIResponse {
  message: string;
  suggestions: string[];
  generatedText?: string;
  businessData?: BusinessMetrics;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalJobs: number;
  averageJobValue: number;
  customerSatisfaction: number;
  lastRefreshed?: string;
  metrics?: {
    clients?: {
      total: number;
    };
    jobs?: {
      total: number;
      scheduled: number;
    };
    revenue?: {
      total: number;
    };
  };
}

// Phone number related types
export interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  country_code: string;
  region?: string;
  locality?: string;
  rate_center?: string;
  latitude?: number;
  longitude?: number;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  phone_number_type: string;
  price_unit: string;
  price: number;
  monthly_price: number;
  status: 'available' | 'purchased' | 'released';
  twilio_sid?: string;
  purchased_by?: string;
  purchased_at?: string;
  assigned_to?: string;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumberPurchase {
  id: string;
  phone_number_id: string;
  user_id: string;
  purchase_price: number;
  monthly_cost: number;
  purchase_date: string;
  status: 'active' | 'cancelled' | 'released';
  twilio_account_sid?: string;
  twilio_phone_number_sid?: string;
  notes?: string;
  created_at: string;
}
