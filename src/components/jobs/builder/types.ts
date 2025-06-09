
export interface LineItem {
  id: string;
  name: string;
  description: string; // Made required to match unified builder
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  taxable?: boolean;
  tags?: string[];
}
