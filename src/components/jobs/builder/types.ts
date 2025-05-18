
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  ourPrice?: number;
  taxable?: boolean;
  tags: string[];
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  ourPrice?: number;
  taxable?: boolean;
}
