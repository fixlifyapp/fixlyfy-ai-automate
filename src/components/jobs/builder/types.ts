
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  ourPrice?: number;
  taxable: boolean;
  tags?: string[];
  sku?: string;
  quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  total?: number;
  
  // Additional properties that are used in the code but not in the database
  discount?: number;
  ourPrice?: number;
  tax?: number;
  price?: number;
  name?: string;
}
