
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  discount?: number;
  ourPrice?: number;
  name?: string;
  price?: number;
  total: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  category?: string;
  sku?: string;
  tags?: string[];
  taxable: boolean;
  ourprice?: number;
}

export interface EstimateFormData {
  estimateNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}
