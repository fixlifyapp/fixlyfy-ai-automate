
export interface PhoneNumberPlan {
  id: string;
  name: string;
  description?: string;
  price_per_number: number;
  monthly_fee: number;
  setup_fee: number;
  features: {
    sms?: boolean;
    voice?: boolean;
    ai_dispatcher?: boolean;
    call_recording?: boolean;
    advanced_routing?: boolean;
    analytics?: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumberPurchase {
  id: string;
  company_id: string;
  phone_number: string;
  telnyx_number_id?: string;
  plan_id: string;
  purchase_price: number;
  monthly_fee: number;
  status: 'active' | 'suspended' | 'cancelled';
  purchased_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  plan?: PhoneNumberPlan;
}

export interface PhoneNumberAssignment {
  id: string;
  company_id: string;
  phone_number: string;
  purchase_id: string;
  assigned_name?: string;
  ai_settings: {
    enabled?: boolean;
    voice?: string;
    greeting?: string;
    business_hours?: any;
    emergency_detection?: boolean;
  };
  sms_settings: {
    enabled?: boolean;
    auto_reply?: boolean;
    keywords?: string[];
  };
  call_settings: {
    enabled?: boolean;
    forwarding_number?: string;
    voicemail_enabled?: boolean;
    call_recording?: boolean;
  };
  is_active: boolean;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  purchase?: PhoneNumberPurchase;
}

export interface PhoneNumberBilling {
  id: string;
  company_id: string;
  phone_number: string;
  purchase_id: string;
  billing_period_start: string;
  billing_period_end: string;
  sms_count: number;
  call_minutes: number;
  monthly_fee: number;
  usage_charges: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TelnyxNumber {
  phone_number: string;
  region_information?: {
    region_name?: string;
    region_type?: string;
  };
  features?: string[];
  cost_information?: {
    upfront_cost?: string;
    monthly_cost?: string;
  };
}
