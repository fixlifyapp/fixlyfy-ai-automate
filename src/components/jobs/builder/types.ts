
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
  discount?: number;
  ourPrice?: number;
  unit?: string;
  category?: string;
  name?: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  category?: string;
  description?: string;
  unit?: string;
  ourprice?: number;
  taxable?: boolean;
  quantity?: number;
  tags?: string[];
  our_price?: number;
}

export interface DocumentData {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  jobId: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  total: number;
}
