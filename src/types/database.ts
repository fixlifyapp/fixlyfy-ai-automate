
export interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  country_code: string;
  region?: string;
  locality?: string;
  address_requirements?: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: string;
  monthly_price: number;
  purchased_by?: string;
  purchased_at?: string;
  assigned_to?: string;
  webhook_url?: string;
  ai_dispatcher_enabled?: boolean;
  connect_phone_number_arn?: string;
  connect_instance_id?: string;
  created_at: string;
  updated_at: string;
}

// Legacy types for backwards compatibility
export interface AIResponse {
  recommendations: string[];
  insights: string[];
  actionItems: string[];
}

export interface BusinessMetrics {
  totalRevenue: number;
  jobsCompleted: number;
  averageJobValue: number;
  customerSatisfaction: number;
}

export interface TeamMemberCommission {
  id: string;
  user_id: string;
  base_rate: number;
  rules: any;
  fees: any;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberSkill {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_code: string;
  user_id: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateTeamMemberCommissionParams {
  user_id: string;
  base_rate: number;
  rules: any;
  fees: any;
}
