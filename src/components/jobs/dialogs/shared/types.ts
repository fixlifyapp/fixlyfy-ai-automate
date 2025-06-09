
export interface UpsellItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  reasoning?: string;
  priority?: 'high' | 'medium' | 'low';
}
