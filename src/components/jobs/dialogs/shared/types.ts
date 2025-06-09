
export interface UpsellItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isSelected?: boolean;
}

export interface UpsellStepProps {
  documentTotal: number;
  onContinue: (items: UpsellItem[], notes: string) => void;
  onBack: () => void;
  existingUpsellItems?: UpsellItem[];
  jobContext?: {
    job_type?: string;
    service_category?: string;
    job_value?: number;
    client_history?: any;
    estimateId?: string;
  };
}

export interface SendDocumentProps {
  documentId: string;
  documentNumber: string;
  documentType: 'estimate' | 'invoice';
  total: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}
