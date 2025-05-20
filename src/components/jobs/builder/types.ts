
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
  
  // Additional properties that are used in the code but not in the database
  discount?: number;
  ourPrice?: number;
  tax?: number;
  price?: number;
  name?: string;
}
