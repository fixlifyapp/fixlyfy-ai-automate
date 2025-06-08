
import React from "react";
import { SendDocumentDialog } from "../shared/SendDocumentDialog";
import { useEstimateSendingInterface } from "../shared/hooks/useSendingInterface";
import { useJobData } from "../unified/hooks/useJobData";

interface EstimateSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  estimateNumber: string;
  total: number;
  jobId?: string;
  onSuccess?: () => void;
  onSave?: () => Promise<boolean>;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const EstimateSendDialog = ({ 
  isOpen, 
  onClose, 
  estimateId, 
  estimateNumber, 
  total,
  jobId,
  onSuccess,
  onSave,
  contactInfo: propContactInfo
}: EstimateSendDialogProps) => {
  const { sendDocument, isProcessing } = useEstimateSendingInterface();

  // Fetch job and client data using the optimized hook
  const { clientInfo, loading: jobDataLoading } = useJobData(jobId || '');

  // Use prop contactInfo if provided, otherwise use fetched clientInfo
  const contactInfo = propContactInfo || {
    name: clientInfo?.name || 'Client',
    email: clientInfo?.email || '',
    phone: clientInfo?.phone || ''
  };

  const handleSend = async (params: {
    sendMethod: "email" | "sms";
    sendTo: string;
    customNote: string;
  }) => {
    const result = await sendDocument({
      sendMethod: params.sendMethod,
      sendTo: params.sendTo,
      documentNumber: estimateNumber,
      documentDetails: { estimate_number: estimateNumber },
      lineItems: [],
      contactInfo,
      customNote: params.customNote,
      jobId: estimateId,
      onSave: onSave || (() => Promise.resolve(true)),
      existingDocumentId: estimateId
    });

    if (result.success && onSuccess) {
      onSuccess();
    }

    return result;
  };

  if (jobDataLoading) {
    return (
      <SendDocumentDialog
        isOpen={isOpen}
        onClose={onClose}
        documentType="estimate"
        documentId={estimateId}
        documentNumber={estimateNumber}
        total={total}
        contactInfo={{ name: 'Loading...', email: '', phone: '' }}
        onSend={() => Promise.resolve({ success: false, error: 'Loading...' })}
        isProcessing={true}
      />
    );
  }

  return (
    <SendDocumentDialog
      isOpen={isOpen}
      onClose={onClose}
      documentType="estimate"
      documentId={estimateId}
      documentNumber={estimateNumber}
      total={total}
      contactInfo={contactInfo}
      onSend={handleSend}
      isProcessing={isProcessing}
    />
  );
};
