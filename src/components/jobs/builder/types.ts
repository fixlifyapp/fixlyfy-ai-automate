
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
  ourPrice?: number;
  unit?: string;
  category?: string;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  ourprice?: number;
  cost?: number;
  our_price?: number;
  unit?: string;
  taxable?: boolean;
  quantity?: number;
  tags?: string[];
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface EstimateData {
  id?: string;
  estimateNumber: string;
  clientId?: string;
  jobId: string;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
  notes?: string;
  terms?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  clientId?: string;
  jobId: string;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';
  notes?: string;
  terms?: string;
  issueDate?: string;
  dueDate?: string;
  amountPaid?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}
