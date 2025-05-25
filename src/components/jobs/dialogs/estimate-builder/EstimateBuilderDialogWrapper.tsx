
import React from 'react';
import { EstimateBuilderDialog } from './EstimateBuilderDialog';

interface EstimateBuilderDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string | null;
  jobId: string;
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  onSyncToInvoice: () => void;
}

export const EstimateBuilderDialogWrapper = (props: EstimateBuilderDialogWrapperProps) => {
  return <EstimateBuilderDialog {...props} />;
};
