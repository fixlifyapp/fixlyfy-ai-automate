
export interface AiSuggestion {
  id: number;
  tip: string;
  type: "info" | "recommendation" | "insight" | "warning" | "upsell";
  category?: "revenue" | "efficiency" | "customer" | "sales" | "upsell";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface QuickAction {
  id: number;
  name: string;
  variant: string;
  className: string;
  icon: React.ComponentType<{ size?: number | undefined; className?: string | undefined }>;
}

export interface AiFinanceInsight {
  id: number;
  tip: string;
  type: "info" | "recommendation" | "insight" | "warning" | "upsell";
  category: "revenue" | "efficiency" | "customer" | "sales" | "upsell";
  action?: {
    label: string;
    onClick: () => void;
  };
  date: string;
}
