
export interface UpsellItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  selected?: boolean;
  reasoning?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface SendingOptions {
  method: 'email' | 'sms';
  recipient: string;
  subject?: string;
  message?: string;
}

export interface DocumentData {
  id?: string;
  type: 'estimate' | 'invoice';
  items: any[];
  total: number;
  notes: string;
}
