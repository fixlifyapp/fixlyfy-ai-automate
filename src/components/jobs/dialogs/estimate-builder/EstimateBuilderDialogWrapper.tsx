
import React from 'react';
import { EstimateBuilderDialog } from './EstimateBuilderDialog';
import { useJobs } from '@/hooks/useJobs';

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

export const EstimateBuilderDialogWrapper = ({
  open,
  onOpenChange,
  estimateId,
  jobId,
  onSyncToInvoice
}: EstimateBuilderDialogWrapperProps) => {
  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId);
  
  if (!job) {
    return null;
  }

  return (
    <EstimateBuilderDialog
      open={open}
      onOpenChange={onOpenChange}
      job={job}
      estimateId={estimateId || undefined}
      onSuccess={() => onOpenChange(false)}
    />
  );
};
