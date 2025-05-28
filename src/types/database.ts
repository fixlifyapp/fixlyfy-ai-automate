
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
