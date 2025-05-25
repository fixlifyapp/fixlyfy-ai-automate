
export interface ClientProperty {
  id: string;
  client_id: string;
  property_name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  property_type?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyInput {
  client_id: string;
  property_name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  property_type?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface UpdatePropertyInput {
  property_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  property_type?: string;
  is_primary?: boolean;
  notes?: string;
}
