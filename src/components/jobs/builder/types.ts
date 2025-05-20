
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
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  total?: number;
}
