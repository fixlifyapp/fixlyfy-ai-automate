
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  total?: number;
  discount?: number;
  ourPrice?: number;
  tax?: number;
  price?: number;
  name?: string;
}

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

export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

export interface DocumentFormData {
  documentId?: string;
  documentNumber: string;
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

export interface JobContext {
  job_type?: string;
  service_category?: string;
  job_value?: number;
  client_history?: any;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

// Standardized function signatures for line item operations
export interface LineItemOperations {
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onLineItemsChange: (items: LineItem[]) => void;
}

// Standardized calculation functions
export interface CalculationOperations {
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
}

// Common props for unified components
export interface UnifiedStepProps extends LineItemOperations, CalculationOperations {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
}

// Upsell step props
export interface UpsellStepProps {
  onContinue: (upsellItems: UpsellItem[], notes: string) => void;
  onBack: () => void;
  documentTotal: number;
  existingUpsellItems?: UpsellItem[];
  estimateToConvert?: any;
  jobContext?: JobContext;
}
