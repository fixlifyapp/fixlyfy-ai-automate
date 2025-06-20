
export interface EstimateData {
  id: string;
  estimate_number: string;
  total: number;
  jobs?: {
    id: string;
    title: string;
    description?: string;
    address?: string;
    clients?: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface SMSRequest {
  estimateId: string;
  recipientPhone: string;
  fromNumber: string;
  message?: string;
}

export interface TelnyxResponse {
  data?: {
    id: string;
  };
  errors?: Array<{
    detail: string;
  }>;
}
