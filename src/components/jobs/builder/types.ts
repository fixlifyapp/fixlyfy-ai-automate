
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  ourPrice?: number;
  cost?: number;
  taxable?: boolean;
  tags?: string[];
  sku?: string;
}

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  unitPrice?: number;
  discount?: number;
  tax?: number;
  total?: number;
  ourPrice?: number;
  taxable: boolean;
}
